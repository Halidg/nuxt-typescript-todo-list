import type { HistoryEntry } from '~/entities/note/model/history';
import type { TimeoutHandle } from '~/shared/lib/timers';

export interface TextEditDraft {
  key: string;
  before: string;
  createEntry: (before: string, after: string) => HistoryEntry;
}

interface PendingTextEdit extends TextEditDraft {
  timer: TimeoutHandle | null;
}

export interface TextEditBufferOptions {
  delayMs: number;
  readAfter: (key: string) => string | undefined;
  onCommit: (entry: HistoryEntry) => void;
}

export interface TextEditBuffer {
  schedule: (edit: TextEditDraft) => void;
  commit: (key: string) => void;
  flush: () => void;
  clear: () => void;
}

export function createTextEditBuffer(options: TextEditBufferOptions): TextEditBuffer {
  const pendingTextEdits = new Map<string, PendingTextEdit>();

  function commit(key: string): void {
    const pending = pendingTextEdits.get(key);
    if (!pending) {
      return;
    }

    if (pending.timer) {
      clearTimeout(pending.timer);
    }

    const after = options.readAfter(key);
    pendingTextEdits.delete(key);

    if (typeof after === 'string' && pending.before !== after) {
      options.onCommit(pending.createEntry(pending.before, after));
    }
  }

  function schedule(edit: TextEditDraft): void {
    const existing = pendingTextEdits.get(edit.key);
    if (existing?.timer) {
      clearTimeout(existing.timer);
    }

    pendingTextEdits.set(edit.key, {
      ...edit,
      before: existing?.before ?? edit.before,
      timer: setTimeout(() => {
        commit(edit.key);
      }, options.delayMs),
    });
  }

  function flush(): void {
    for (const key of [...pendingTextEdits.keys()]) {
      commit(key);
    }
  }

  function clear(): void {
    for (const pending of pendingTextEdits.values()) {
      if (pending.timer) {
        clearTimeout(pending.timer);
      }
    }

    pendingTextEdits.clear();
  }

  return {
    schedule,
    commit,
    flush,
    clear,
  };
}
