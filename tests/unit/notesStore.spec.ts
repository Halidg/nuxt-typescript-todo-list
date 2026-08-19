import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { NOTES_STORAGE_KEY, parseNotesPayload, useNotesStore } from '~/entities/note/model/notesStore';
import type { Note } from '~/entities/note/model/types';

function makeNote(id = 'note_1'): Note {
  return {
    id,
    title: 'Stored note',
    createdAt: '2026-08-19T00:00:00.000Z',
    updatedAt: '2026-08-19T00:00:00.000Z',
    todos: [{ id: 'todo_1', text: 'Persist me', completed: false }],
  };
}

describe('notes store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('persists notes with schema version only on explicit store actions', () => {
    const store = useNotesStore();
    const note = makeNote();

    expect(window.localStorage.getItem(NOTES_STORAGE_KEY)).toBeNull();

    store.upsertNote(note);

    expect(JSON.parse(window.localStorage.getItem(NOTES_STORAGE_KEY) ?? '{}')).toEqual({
      version: 1,
      notes: [note],
    });
  });

  it('hydrates valid payloads and ignores unsupported schema versions', () => {
    const store = useNotesStore();
    const note = makeNote();

    window.localStorage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        notes: [note],
      }),
    );

    store.hydrate();
    expect(store.notes).toEqual([note]);

    window.localStorage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify({
        version: 99,
        notes: [makeNote('note_2')],
      }),
    );

    store.hydrate();
    expect(store.notes).toEqual([]);
  });

  it('returns cloned notes and deletes persisted notes safely', () => {
    const store = useNotesStore();
    const note = makeNote();

    store.upsertNote(note);

    const cloned = store.getNote(note.id);
    expect(cloned).toEqual(note);
    expect(cloned).not.toBe(store.notes[0]);

    if (cloned) {
      cloned.title = 'Mutated outside store';
    }

    expect(store.notes[0]?.title).toBe('Stored note');

    store.deleteNote(note.id);
    expect(store.notes).toEqual([]);
    expect(JSON.parse(window.localStorage.getItem(NOTES_STORAGE_KEY) ?? '{}')).toEqual({
      version: 1,
      notes: [],
    });
  });

  it('updates todo completion from previews and persists the note', () => {
    const store = useNotesStore();
    const note = makeNote();

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-19T12:00:00.000Z'));

    store.upsertNote(note);
    store.setTodoCompleted(note.id, 'todo_1', true);

    expect(store.notes[0]?.todos[0]?.completed).toBe(true);
    expect(store.notes[0]?.updatedAt).toBe('2026-08-19T12:00:00.000Z');
    expect(JSON.parse(window.localStorage.getItem(NOTES_STORAGE_KEY) ?? '{}')).toEqual({
      version: 1,
      notes: [
        {
          ...note,
          updatedAt: '2026-08-19T12:00:00.000Z',
          todos: [{ id: 'todo_1', text: 'Persist me', completed: true }],
        },
      ],
    });
  });

  it('parses malformed storage payloads as an empty collection', () => {
    expect(parseNotesPayload('{')).toEqual([]);
    expect(parseNotesPayload(null)).toEqual([]);
    expect(parseNotesPayload(JSON.stringify({ version: 1, notes: [{ id: 'broken' }] }))).toEqual([]);
  });
});
