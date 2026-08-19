<script setup lang="ts">
import { computed } from 'vue';
import type { Note } from '../model/types';

const props = defineProps<{
  note: Note;
}>();

const previewTodos = computed(() => props.note.todos.slice(0, 4));
const hiddenTodosCount = computed(() => Math.max(0, props.note.todos.length - previewTodos.value.length));
const completedCount = computed(() => props.note.todos.filter((todo) => todo.completed).length);
</script>

<template>
  <article class="note-card">
    <header class="note-card__header">
      <div>
        <h2 class="note-card__title">{{ note.title || 'Без названия' }}</h2>
        <p class="note-card__meta">
          {{ completedCount }} из {{ note.todos.length }} выполнено
        </p>
      </div>
      <slot name="actions" :note="note" />
    </header>

    <ul v-if="previewTodos.length" class="note-card__todos" aria-label="Список задач">
      <li v-for="todo in previewTodos" :key="todo.id" class="note-card__todo">
        <span class="note-card__checkbox" :class="{ 'note-card__checkbox--checked': todo.completed }" aria-hidden="true" />
        <span class="note-card__todo-text" :class="{ 'note-card__todo-text--done': todo.completed }">
          {{ todo.text || 'Новая задача' }}
        </span>
      </li>
      <li v-if="hiddenTodosCount > 0" class="note-card__more">
        Еще {{ hiddenTodosCount }}
      </li>
    </ul>

    <p v-else class="note-card__empty">Список задач пока пуст</p>
  </article>
</template>

<style scoped lang="scss">
.note-card {
  display: grid;
  min-height: 210px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 20px;
  background: var(--surface);
  box-shadow: 0 12px 30px rgba(38, 45, 42, 0.07);
}

.note-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
}

.note-card__title {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  font-size: 1.18rem;
  line-height: 1.3;
  letter-spacing: 0;
  overflow-wrap: anywhere;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.note-card__meta {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 0.88rem;
}

.note-card__todos {
  display: grid;
  gap: 10px;
  align-self: end;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

.note-card__todo {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
}

.note-card__checkbox {
  display: block;
  width: 18px;
  height: 18px;
  border: 2px solid #9eb0aa;
  border-radius: 5px;
  background: #fff;
}

.note-card__checkbox--checked {
  border-color: var(--accent);
  background:
    linear-gradient(135deg, transparent 42%, #fff 43% 56%, transparent 57%),
    linear-gradient(45deg, transparent 51%, #fff 52% 62%, transparent 63%),
    var(--accent);
}

.note-card__todo-text {
  min-width: 0;
  color: #34413d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-card__todo-text--done {
  color: #82908c;
  text-decoration: line-through;
}

.note-card__more,
.note-card__empty {
  color: var(--muted);
  font-size: 0.92rem;
}

.note-card__empty {
  align-self: end;
  margin: 22px 0 0;
}
</style>
