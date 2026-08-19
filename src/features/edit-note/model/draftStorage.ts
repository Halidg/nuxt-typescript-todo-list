import { isClient } from '~/shared/lib/client';
import type { Note } from '~/entities/note/model/types';
import { cloneNote } from '~/entities/note/model/normalizers';

export interface NoteDraftPayload {
  version: 1;
  note: Note;
  savedAt: string;
}

const DRAFT_PREFIX = 'fsd-todo-notes:draft:';

export function getDraftStorageKey(noteId: string): string {
  return `${DRAFT_PREFIX}${noteId}`;
}

export function readNoteDraft(draftKey: string): NoteDraftPayload | null {
  if (!isClient()) {
    return null;
  }

  const raw = window.localStorage.getItem(getDraftStorageKey(draftKey));
  if (!raw) {
    return null;
  }

  try {
    const payload = JSON.parse(raw) as NoteDraftPayload;

    if (payload.version !== 1 || !payload.note || typeof payload.savedAt !== 'string') {
      return null;
    }

    return {
      version: 1,
      note: cloneNote(payload.note),
      savedAt: payload.savedAt,
    };
  } catch {
    return null;
  }
}

export function writeNoteDraft(note: Note, draftKey = note.id): void {
  if (!isClient()) {
    return;
  }

  const payload: NoteDraftPayload = {
    version: 1,
    note: cloneNote(note),
    savedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(getDraftStorageKey(draftKey), JSON.stringify(payload));
}

export function clearNoteDraft(draftKey: string): void {
  if (!isClient()) {
    return;
  }

  window.localStorage.removeItem(getDraftStorageKey(draftKey));
}
