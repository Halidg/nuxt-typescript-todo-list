import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { navigateTo } from '#app';
import { createId } from '~/shared/lib/ids';
import type { TimeoutHandle } from '~/shared/lib/timers';
import { useNotesStore } from '~/entities/note/model/notesStore';
import type { Note, TodoItem } from '~/entities/note/model/types';
import { cloneNote, normalizeNoteForSave } from '~/entities/note/model/normalizers';
import {
  commitHistoryEntry,
  createNoteHistory,
  redoHistory,
  resetHistory,
  undoHistory,
  type HistoryEntry,
} from '~/entities/note/model/history';
import { clearNoteDraft, readNoteDraft, writeNoteDraft, type NoteDraftPayload } from './draftStorage';
import { createTextEditBuffer, type TextEditDraft } from './textEditBuffer';

export interface EditorSessionOptions {
  noteId: string;
}

const TEXT_COMMIT_DELAY = 700;

function createEmptyNote(id: string): Note {
  const now = new Date().toISOString();

  return {
    id,
    title: '',
    todos: [],
    createdAt: now,
    updatedAt: now,
  };
}

function sameNote(left: Note, right: Note): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function useNoteEditorSession(options: EditorSessionOptions) {
  const store = useNotesStore();
  const isNew = computed(() => options.noteId === 'new');
  const resolvedId = isNew.value ? createId('note') : options.noteId;
  const originalNote = ref<Note | null>(null);
  const draft = ref<Note>(createEmptyNote(resolvedId));
  const storageDraftKey = computed(() => (isNew.value ? 'new' : draft.value.id));
  const history = reactive(createNoteHistory());
  const draftWriteTimer = ref<TimeoutHandle | null>(null);
  const pendingDraft = ref<NoteDraftPayload | null>(null);
  const showRestorePrompt = ref(false);
  const noteWasDeletedElsewhere = ref(false);
  const initialized = ref(false);
  const skipUnmountDraftWrite = ref(false);

  const canUndo = computed(() => history.past.length > 0);
  const canRedo = computed(() => history.future.length > 0);
  const hasTodos = computed(() => draft.value.todos.length > 0);
  const completedCount = computed(() => draft.value.todos.filter((todo) => todo.completed).length);
  const isMissingExisting = computed(() => !isNew.value && originalNote.value === null && noteWasDeletedElsewhere.value);

  const textEditBuffer = createTextEditBuffer({
    delayMs: TEXT_COMMIT_DELAY,
    readAfter: (key) =>
      key === 'title' ? draft.value.title : draft.value.todos.find((todo) => `todo:${todo.id}` === key)?.text,
    onCommit: (entry) => {
      commitHistoryEntry(history, entry);
    },
  });

  function setDraft(next: Note): void {
    draft.value = cloneNote(next);
    scheduleDraftWrite();
  }

  function scheduleDraftWrite(): void {
    if (draftWriteTimer.value) {
      clearTimeout(draftWriteTimer.value);
    }

    draftWriteTimer.value = setTimeout(() => {
      writeNoteDraft(draft.value, storageDraftKey.value);
      draftWriteTimer.value = null;
    }, 500);
  }

  function flushDraftWrite(): void {
    if (draftWriteTimer.value) {
      clearTimeout(draftWriteTimer.value);
      draftWriteTimer.value = null;
    }

    writeNoteDraft(draft.value, storageDraftKey.value);
  }

  function flushTextEdits(): void {
    textEditBuffer.flush();
  }

  function commitImmediate(entry: HistoryEntry, next: Note): void {
    flushTextEdits();
    draft.value = cloneNote(next);
    commitHistoryEntry(history, entry);
    scheduleDraftWrite();
  }

  function updateTitle(title: string): void {
    const before = draft.value.title;
    draft.value = {
      ...draft.value,
      title,
    };
    const edit: TextEditDraft = {
      key: 'title',
      before,
      createEntry: (previous, next) => ({
        type: 'set-title',
        before: previous,
        after: next,
      }),
    };

    textEditBuffer.schedule(edit);
    scheduleDraftWrite();
  }

  function commitTitle(): void {
    textEditBuffer.commit('title');
  }

  function addTodo(): void {
    const todo: TodoItem = {
      id: createId('todo'),
      text: '',
      completed: false,
    };
    const index = draft.value.todos.length;
    const next = {
      ...draft.value,
      todos: [...draft.value.todos, todo],
    };

    commitImmediate({ type: 'add-todo', todo, index }, next);
  }

  function removeTodo(todoId: string): void {
    const index = draft.value.todos.findIndex((todo) => todo.id === todoId);
    if (index === -1) {
      return;
    }

    const todo = draft.value.todos[index];
    if (!todo) {
      return;
    }

    textEditBuffer.commit(`todo:${todoId}`);

    const next = {
      ...draft.value,
      todos: draft.value.todos.filter((item) => item.id !== todoId),
    };

    commitImmediate({ type: 'remove-todo', todo: { ...todo }, index }, next);
  }

  function updateTodoText(todoId: string, text: string): void {
    const current = draft.value.todos.find((todo) => todo.id === todoId);
    if (!current) {
      return;
    }

    const key = `todo:${todoId}`;
    const before = current.text;

    draft.value = {
      ...draft.value,
      todos: draft.value.todos.map((todo) => (todo.id === todoId ? { ...todo, text } : todo)),
    };

    const edit: TextEditDraft = {
      key,
      before,
      createEntry: (previous, next) => ({
        type: 'set-todo-text',
        todoId,
        before: previous,
        after: next,
      }),
    };

    textEditBuffer.schedule(edit);
    scheduleDraftWrite();
  }

  function commitTodoText(todoId: string): void {
    textEditBuffer.commit(`todo:${todoId}`);
  }

  function toggleTodo(todoId: string): void {
    const current = draft.value.todos.find((todo) => todo.id === todoId);
    if (!current) {
      return;
    }

    const nextCompleted = !current.completed;
    const next = {
      ...draft.value,
      todos: draft.value.todos.map((todo) => (todo.id === todoId ? { ...todo, completed: nextCompleted } : todo)),
    };

    commitImmediate(
      {
        type: 'set-todo-completed',
        todoId,
        before: current.completed,
        after: nextCompleted,
      },
      next,
    );
  }

  function undo(): void {
    flushTextEdits();
    draft.value = undoHistory(draft.value, history);
    scheduleDraftWrite();
  }

  function redo(): void {
    flushTextEdits();
    draft.value = redoHistory(draft.value, history);
    scheduleDraftWrite();
  }

  function save(): Note {
    flushTextEdits();
    const normalized = normalizeNoteForSave(draft.value);
    store.upsertNote(normalized);
    originalNote.value = cloneNote(normalized);
    draft.value = cloneNote(normalized);
    resetHistory(history);
    clearNoteDraft(normalized.id);
    if (isNew.value) {
      clearNoteDraft('new');
    }
    skipUnmountDraftWrite.value = true;

    return normalized;
  }

  function cancel(): void {
    resetHistory(history);
    clearNoteDraft(storageDraftKey.value);
    skipUnmountDraftWrite.value = true;
    void navigateTo('/');
  }

  function deleteCurrent(): void {
    store.deleteNote(draft.value.id);
    resetHistory(history);
    clearNoteDraft(storageDraftKey.value);
    clearNoteDraft(draft.value.id);
    skipUnmountDraftWrite.value = true;
    void navigateTo('/');
  }

  function restoreDraft(): void {
    if (pendingDraft.value) {
      setDraft(pendingDraft.value.note);
    }

    pendingDraft.value = null;
    showRestorePrompt.value = false;
  }

  function discardDraft(): void {
    clearNoteDraft(storageDraftKey.value);
    pendingDraft.value = null;
    showRestorePrompt.value = false;
  }

  function initialize(): void {
    store.hydrate();

    if (isNew.value) {
      const emptyNote = createEmptyNote(resolvedId);
      originalNote.value = null;
      draft.value = emptyNote;
    } else {
      const existing = store.getNote(options.noteId);

      if (!existing) {
        originalNote.value = null;
        noteWasDeletedElsewhere.value = true;
        initialized.value = true;
        return;
      }

      originalNote.value = cloneNote(existing);
      draft.value = cloneNote(existing);
    }

    const savedDraft = readNoteDraft(storageDraftKey.value);

    if (savedDraft && !sameNote(savedDraft.note, draft.value)) {
      pendingDraft.value = savedDraft;
      showRestorePrompt.value = true;
    }

    initialized.value = true;
  }

  const stopDeletedWatch = watch(
    () => store.notes,
    () => {
      if (isNew.value || !store.hydrated) {
        return;
      }

      noteWasDeletedElsewhere.value = !store.notes.some((note) => note.id === options.noteId);
    },
    { deep: true },
  );

  function handleKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const isEditableTarget =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      Boolean(target?.isContentEditable);

    if (isEditableTarget || !(event.metaKey || event.ctrlKey)) {
      return;
    }

    const key = event.key.toLowerCase();
    if (key !== 'z') {
      return;
    }

    event.preventDefault();

    if (event.shiftKey) {
      redo();
    } else {
      undo();
    }
  }

  onMounted(() => {
    initialize();
    window.addEventListener('keydown', handleKeydown);
  });

  onBeforeUnmount(() => {
    flushTextEdits();

    if (draftWriteTimer.value) {
      clearTimeout(draftWriteTimer.value);
    }
    textEditBuffer.clear();

    if (
      !skipUnmountDraftWrite.value &&
      (history.past.length > 0 || (originalNote.value && !sameNote(originalNote.value, draft.value)))
    ) {
      flushDraftWrite();
    }

    stopDeletedWatch();
    window.removeEventListener('keydown', handleKeydown);
  });

  return {
    draft,
    history,
    isNew,
    canUndo,
    canRedo,
    hasTodos,
    completedCount,
    pendingDraft,
    showRestorePrompt,
    noteWasDeletedElsewhere,
    isMissingExisting,
    initialized,
    addTodo,
    removeTodo,
    updateTitle,
    commitTitle,
    updateTodoText,
    commitTodoText,
    toggleTodo,
    undo,
    redo,
    save,
    cancel,
    deleteCurrent,
    restoreDraft,
    discardDraft,
  };
}
