<script setup lang="ts">
import { Trash2 } from '@lucide/vue';
import type { TodoItem } from '~/entities/note/model/types';
import IconButton from '~/shared/ui/IconButton.vue';

defineProps<{
  todo: TodoItem;
}>();

const emit = defineEmits<{
  toggle: [todoId: string];
  remove: [todoId: string];
  updateText: [todoId: string, text: string];
  commitText: [todoId: string];
}>();

function readInputValue(event: Event): string {
  return event.target instanceof HTMLInputElement ? event.target.value : '';
}
</script>

<template>
  <li class="todo-row">
    <label class="todo-row__check">
      <input
        class="todo-row__checkbox"
        type="checkbox"
        :checked="todo.completed"
        @change="emit('toggle', todo.id)"
      />
      <span class="visually-hidden">Отметить как выполненную</span>
    </label>

    <input
      class="todo-row__input"
      :class="{ 'todo-row__input--done': todo.completed }"
      :value="todo.text"
      placeholder="Текст задачи"
      @input="emit('updateText', todo.id, readInputValue($event))"
      @blur="emit('commitText', todo.id)"
    />

    <IconButton label="Удалить задачу" variant="danger" @click="emit('remove', todo.id)">
      <Trash2 />
    </IconButton>
  </li>
</template>

<style scoped lang="scss">
.todo-row {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 38px;
  align-items: center;
  gap: 12px;
  min-height: 54px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 8px;
  background: var(--surface);
}

.todo-row__check {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
}

.todo-row__checkbox {
  width: 20px;
  height: 20px;
  margin: 0;
  accent-color: var(--accent);
}

.todo-row__input {
  width: 100%;
  min-width: 0;
  min-height: 38px;
  border: 0;
  border-radius: 6px;
  padding: 8px 10px;
  color: var(--ink);
  background: transparent;
  outline: none;
  overflow-wrap: anywhere;

  &:focus {
    background: var(--surface-muted);
    box-shadow: 0 0 0 3px rgba(46, 126, 163, 0.14);
  }
}

.todo-row__input--done {
  color: #7d8b86;
  text-decoration: line-through;
}

@media (max-width: 560px) {
  .todo-row {
    grid-template-columns: 28px minmax(0, 1fr);
  }

  .todo-row :deep(.icon-button) {
    grid-column: 2;
    justify-self: end;
  }
}
</style>
