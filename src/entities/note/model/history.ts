import type { Note, TodoItem } from './types';
import { cloneNote } from './normalizers';

export type HistoryEntry =
  | {
      type: 'set-title';
      before: string;
      after: string;
    }
  | {
      type: 'set-todo-text';
      todoId: string;
      before: string;
      after: string;
    }
  | {
      type: 'set-todo-completed';
      todoId: string;
      before: boolean;
      after: boolean;
    }
  | {
      type: 'add-todo';
      todo: TodoItem;
      index: number;
    }
  | {
      type: 'remove-todo';
      todo: TodoItem;
      index: number;
    };

export interface NoteHistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  limit: number;
}

export const DEFAULT_HISTORY_LIMIT = 50;

function insertTodo(todos: TodoItem[], todo: TodoItem, index: number): TodoItem[] {
  const next = [...todos];
  const boundedIndex = Math.max(0, Math.min(index, next.length));
  next.splice(boundedIndex, 0, { ...todo });
  return next;
}

function removeTodo(todos: TodoItem[], todoId: string): TodoItem[] {
  return todos.filter((todo) => todo.id !== todoId);
}

export function createNoteHistory(limit = DEFAULT_HISTORY_LIMIT): NoteHistoryState {
  return {
    past: [],
    future: [],
    limit,
  };
}

export function applyHistoryEntry(note: Note, entry: HistoryEntry): Note {
  const next = cloneNote(note);

  switch (entry.type) {
    case 'set-title':
      next.title = entry.after;
      return next;

    case 'set-todo-text':
      next.todos = next.todos.map((todo) => (todo.id === entry.todoId ? { ...todo, text: entry.after } : todo));
      return next;

    case 'set-todo-completed':
      next.todos = next.todos.map((todo) =>
        todo.id === entry.todoId ? { ...todo, completed: entry.after } : todo,
      );
      return next;

    case 'add-todo':
      next.todos = insertTodo(next.todos, entry.todo, entry.index);
      return next;

    case 'remove-todo':
      next.todos = removeTodo(next.todos, entry.todo.id);
      return next;
  }
}

export function revertHistoryEntry(note: Note, entry: HistoryEntry): Note {
  const next = cloneNote(note);

  switch (entry.type) {
    case 'set-title':
      next.title = entry.before;
      return next;

    case 'set-todo-text':
      next.todos = next.todos.map((todo) => (todo.id === entry.todoId ? { ...todo, text: entry.before } : todo));
      return next;

    case 'set-todo-completed':
      next.todos = next.todos.map((todo) =>
        todo.id === entry.todoId ? { ...todo, completed: entry.before } : todo,
      );
      return next;

    case 'add-todo':
      next.todos = removeTodo(next.todos, entry.todo.id);
      return next;

    case 'remove-todo':
      next.todos = insertTodo(next.todos, entry.todo, entry.index);
      return next;
  }
}

export function commitHistoryEntry(history: NoteHistoryState, entry: HistoryEntry): void {
  const nextPast = [...history.past, entry];
  history.past = nextPast.length > history.limit ? nextPast.slice(nextPast.length - history.limit) : nextPast;
  history.future = [];
}

export function undoHistory(note: Note, history: NoteHistoryState): Note {
  const entry = history.past.pop();
  if (!entry) {
    return note;
  }

  history.future.unshift(entry);
  return revertHistoryEntry(note, entry);
}

export function redoHistory(note: Note, history: NoteHistoryState): Note {
  const entry = history.future.shift();
  if (!entry) {
    return note;
  }

  history.past.push(entry);
  return applyHistoryEntry(note, entry);
}

export function resetHistory(history: NoteHistoryState): void {
  history.past = [];
  history.future = [];
}
