export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  todos: TodoItem[];
  createdAt: string;
  updatedAt: string;
}

export interface NotesSchemaV1 {
  version: 1;
  notes: Note[];
}

export const NOTES_SCHEMA_VERSION = 1;
