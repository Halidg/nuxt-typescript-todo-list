import { afterEach, describe, expect, it, vi } from 'vitest';
import type { HistoryEntry } from '~/entities/note/model/history';
import { createTextEditBuffer } from '~/features/edit-note/model/textEditBuffer';

describe('text edit history buffer', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('records continuous typing in one field as one history entry after a pause', () => {
    vi.useFakeTimers();
    const values = new Map<string, string>([['title', '']]);
    const committed: HistoryEntry[] = [];
    const buffer = createTextEditBuffer({
      delayMs: 700,
      readAfter: (key) => values.get(key),
      onCommit: (entry) => committed.push(entry),
    });

    values.set('title', 'П');
    buffer.schedule({
      key: 'title',
      before: '',
      createEntry: (before, after) => ({ type: 'set-title', before, after }),
    });

    vi.advanceTimersByTime(350);
    values.set('title', 'План');
    buffer.schedule({
      key: 'title',
      before: 'П',
      createEntry: (before, after) => ({ type: 'set-title', before, after }),
    });

    vi.advanceTimersByTime(699);
    expect(committed).toEqual([]);

    vi.advanceTimersByTime(1);
    expect(committed).toEqual([{ type: 'set-title', before: '', after: 'План' }]);
  });

  it('commits text editing on blur immediately', () => {
    vi.useFakeTimers();
    const values = new Map<string, string>([['todo:1', 'Новая задача']]);
    const committed: HistoryEntry[] = [];
    const buffer = createTextEditBuffer({
      delayMs: 700,
      readAfter: (key) => values.get(key),
      onCommit: (entry) => committed.push(entry),
    });

    values.set('todo:1', 'Купить хлеб');
    buffer.schedule({
      key: 'todo:1',
      before: 'Новая задача',
      createEntry: (before, after) => ({
        type: 'set-todo-text',
        todoId: '1',
        before,
        after,
      }),
    });

    buffer.commit('todo:1');
    vi.advanceTimersByTime(700);

    expect(committed).toEqual([
      {
        type: 'set-todo-text',
        todoId: '1',
        before: 'Новая задача',
        after: 'Купить хлеб',
      },
    ]);
  });
});
