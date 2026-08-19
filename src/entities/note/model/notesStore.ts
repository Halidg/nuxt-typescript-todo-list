import { defineStore } from 'pinia';
import { isClient } from '~/shared/lib/client';
import type { Note, NotesSchemaV1 } from './types';
import { NOTES_SCHEMA_VERSION } from './types';
import { cloneNote } from './normalizers';

export const NOTES_STORAGE_KEY = 'fsd-todo-notes:notes';

function isTodoLike(value: unknown): value is Note['todos'][number] {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const todo = value as Note['todos'][number];
  return typeof todo.id === 'string' && typeof todo.text === 'string' && typeof todo.completed === 'boolean';
}

function isNoteLike(value: unknown): value is Note {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const note = value as Note;
  return (
    typeof note.id === 'string' &&
    typeof note.title === 'string' &&
    typeof note.createdAt === 'string' &&
    typeof note.updatedAt === 'string' &&
    Array.isArray(note.todos) &&
    note.todos.every(isTodoLike)
  );
}

export function parseNotesPayload(raw: string | null): Note[] {
  if (!raw) {
    return [];
  }

  try {
    const payload = JSON.parse(raw) as Partial<NotesSchemaV1>;

    if (payload.version !== NOTES_SCHEMA_VERSION || !Array.isArray(payload.notes)) {
      return [];
    }

    return payload.notes.filter(isNoteLike).map(cloneNote);
  } catch {
    return [];
  }
}

export const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: [] as Note[],
    hydrated: false,
  }),

  getters: {
    orderedNotes: (state): Note[] =>
      [...state.notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
  },

  actions: {
    hydrate() {
      if (!isClient()) {
        return;
      }

      this.notes = parseNotesPayload(window.localStorage.getItem(NOTES_STORAGE_KEY));
      this.hydrated = true;
    },

    persist() {
      if (!isClient()) {
        return;
      }

      const payload: NotesSchemaV1 = {
        version: NOTES_SCHEMA_VERSION,
        notes: this.notes.map(cloneNote),
      };

      window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(payload));
    },

    getNote(noteId: string): Note | undefined {
      const note = this.notes.find((item) => item.id === noteId);
      return note ? cloneNote(note) : undefined;
    },

    upsertNote(note: Note) {
      const next = cloneNote(note);
      const index = this.notes.findIndex((item) => item.id === note.id);

      if (index === -1) {
        this.notes = [next, ...this.notes];
      } else {
        this.notes = this.notes.map((item) => (item.id === note.id ? next : item));
      }

      this.persist();
    },

    deleteNote(noteId: string) {
      this.notes = this.notes.filter((note) => note.id !== noteId);
      this.persist();
    },
  },
});
