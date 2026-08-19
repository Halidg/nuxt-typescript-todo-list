import type { Note, TodoItem } from './types';

export function normalizeTitle(title: string): string {
  const normalized = title.trim();
  return normalized.length > 0 ? normalized : 'Без названия';
}

export function normalizeTodoText(text: string): string {
  const normalized = text.trim();
  return normalized.length > 0 ? normalized : 'Новая задача';
}

export function normalizeNoteForSave(note: Note, now = new Date().toISOString()): Note {
  return {
    ...note,
    title: normalizeTitle(note.title),
    todos: note.todos.map<TodoItem>((todo) => ({
      ...todo,
      text: normalizeTodoText(todo.text),
    })),
    updatedAt: now,
  };
}

export function cloneNote(note: Note): Note {
  return {
    ...note,
    todos: note.todos.map((todo) => ({ ...todo })),
  };
}
