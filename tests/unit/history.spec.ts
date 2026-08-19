import { describe, expect, it } from 'vitest';
import {
  commitHistoryEntry,
  createNoteHistory,
  redoHistory,
  undoHistory,
  type HistoryEntry,
} from '~/entities/note/model/history';
import type { Note } from '~/entities/note/model/types';

function makeNote(): Note {
  return {
    id: 'note_1',
    title: 'Initial',
    createdAt: '2026-08-19T00:00:00.000Z',
    updatedAt: '2026-08-19T00:00:00.000Z',
    todos: [
      { id: 'todo_1', text: 'First task', completed: false },
      { id: 'todo_2', text: 'Second task', completed: true },
    ],
  };
}

describe('note history', () => {
  it('undoes and redoes title updates without storing full note copies', () => {
    const history = createNoteHistory();
    const note = makeNote();
    const entry: HistoryEntry = {
      type: 'set-title',
      before: 'Initial',
      after: 'Changed',
    };

    commitHistoryEntry(history, entry);

    const changed = { ...note, title: 'Changed' };
    const undone = undoHistory(changed, history);
    const redone = redoHistory(undone, history);

    expect(undone.title).toBe('Initial');
    expect(redone.title).toBe('Changed');
    expect(history.past[0]).toEqual(entry);
    expect(history.past[0]).not.toHaveProperty('note');
  });

  it('treats todo add, delete and checkbox changes as atomic entries', () => {
    const history = createNoteHistory();
    let note = makeNote();

    const addedTodo = { id: 'todo_3', text: 'Third task', completed: false };
    commitHistoryEntry(history, { type: 'add-todo', todo: addedTodo, index: 2 });
    note = { ...note, todos: [...note.todos, addedTodo] };

    commitHistoryEntry(history, {
      type: 'set-todo-completed',
      todoId: 'todo_3',
      before: false,
      after: true,
    });
    note = { ...note, todos: note.todos.map((todo) => (todo.id === 'todo_3' ? { ...todo, completed: true } : todo)) };

    commitHistoryEntry(history, { type: 'remove-todo', todo: note.todos[0]!, index: 0 });
    note = { ...note, todos: note.todos.slice(1) };

    note = undoHistory(note, history);
    expect(note.todos[0]?.id).toBe('todo_1');

    note = undoHistory(note, history);
    expect(note.todos.find((todo) => todo.id === 'todo_3')?.completed).toBe(false);

    note = undoHistory(note, history);
    expect(note.todos.some((todo) => todo.id === 'todo_3')).toBe(false);
  });

  it('clears redo branch after a new change and keeps only the configured limit', () => {
    const history = createNoteHistory(2);
    let note = makeNote();

    commitHistoryEntry(history, { type: 'set-title', before: 'Initial', after: 'One' });
    note = { ...note, title: 'One' };
    commitHistoryEntry(history, { type: 'set-title', before: 'One', after: 'Two' });
    note = { ...note, title: 'Two' };
    commitHistoryEntry(history, { type: 'set-title', before: 'Two', after: 'Three' });
    note = { ...note, title: 'Three' };

    expect(history.past).toHaveLength(2);
    expect(history.past[0]).toMatchObject({ after: 'Two' });

    note = undoHistory(note, history);
    expect(note.title).toBe('Two');
    expect(history.future).toHaveLength(1);

    commitHistoryEntry(history, { type: 'set-title', before: 'Two', after: 'Branch' });
    expect(history.future).toHaveLength(0);
  });
});
