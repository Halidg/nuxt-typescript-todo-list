<script setup lang="ts">
import { ref } from 'vue';
import { navigateTo } from '#app';
import { AlertTriangle, ArrowLeft, Plus, Redo2, Save, Trash2, Undo2, X } from '@lucide/vue';
import { useNoteEditorSession } from '~/features/edit-note/model/useNoteEditorSession';
import TodoEditorItem from '~/features/manage-todo/ui/TodoEditorItem.vue';
import BaseButton from '~/shared/ui/BaseButton.vue';
import BaseLinkButton from '~/shared/ui/BaseLinkButton.vue';
import IconButton from '~/shared/ui/IconButton.vue';
import ConfirmDialog from '~/shared/ui/ConfirmDialog.vue';

const props = defineProps<{
  noteId: string;
}>();

const {
  draft,
  isNew,
  canUndo,
  canRedo,
  hasTodos,
  completedCount,
  showRestorePrompt,
  pendingDraft,
  noteWasDeletedElsewhere,
  isMissingExisting,
  initialized,
  addTodo,
  removeTodo,
  updateTitle,
  commitTitle,
  updateTodoText,
  commitTodoText,
  toggleTodo,
  undo,
  redo,
  save,
  cancel,
  deleteCurrent,
  restoreDraft,
  discardDraft,
} = useNoteEditorSession({ noteId: props.noteId });

const cancelDialogOpen = ref(false);
const deleteDialogOpen = ref(false);

function readInputValue(event: Event): string {
  return event.target instanceof HTMLInputElement ? event.target.value : '';
}

function saveAndReturn(): void {
  save();
  void navigateTo('/');
}
</script>

<template>
  <main class="page-shell">
    <div v-if="!initialized" class="editor-loading">Загрузка...</div>

    <section v-else-if="isMissingExisting" class="empty-state">
      <div class="empty-state__inner">
        <h1 class="page-title">Заметка не найдена</h1>
        <p>Она могла быть удалена или ссылка содержит неверный идентификатор.</p>
        <BaseLinkButton to="/" variant="primary">
          <template #icon>
            <ArrowLeft />
          </template>
          К списку заметок
        </BaseLinkButton>
      </div>
    </section>

    <template v-else>
      <header class="editor-header">
        <NuxtLink to="/" class="editor-header__back" aria-label="К списку заметок">
          <ArrowLeft aria-hidden="true" />
        </NuxtLink>

        <div class="editor-header__title">
          <p class="editor-header__eyebrow">{{ isNew ? 'Создание' : 'Редактирование' }}</p>
          <h1 class="page-title">{{ draft.title || 'Без названия' }}</h1>
        </div>

        <div class="editor-header__actions">
          <IconButton label="Отменить изменение" :disabled="!canUndo" @click="undo">
            <Undo2 />
          </IconButton>
          <IconButton label="Повторить изменение" :disabled="!canRedo" @click="redo">
            <Redo2 />
          </IconButton>
          <BaseButton variant="secondary" @click="cancelDialogOpen = true">
            <template #icon>
              <X />
            </template>
            Отмена
          </BaseButton>
          <BaseButton v-if="!isNew" variant="danger" @click="deleteDialogOpen = true">
            <template #icon>
              <Trash2 />
            </template>
            Удалить
          </BaseButton>
          <BaseButton variant="primary" @click="saveAndReturn">
            <template #icon>
              <Save />
            </template>
            Сохранить
          </BaseButton>
        </div>
      </header>

      <div v-if="noteWasDeletedElsewhere && !isMissingExisting" class="editor-alert" role="status">
        <AlertTriangle aria-hidden="true" />
        <span>Эта заметка была удалена в другой вкладке. Сохранение создаст ее заново с текущими данными.</span>
      </div>

      <section class="editor-layout">
        <form class="editor-panel" @submit.prevent="saveAndReturn">
          <label class="field">
            <span class="field__label">Название</span>
            <input
              class="input editor-title-input"
              :value="draft.title"
              placeholder="Например, План на неделю"
              @input="updateTitle(readInputValue($event))"
              @blur="commitTitle"
            />
          </label>

          <div class="editor-panel__section">
            <div class="editor-panel__section-head">
              <div>
                <h2>Задачи</h2>
                <p>{{ completedCount }} из {{ draft.todos.length }} выполнено</p>
              </div>
              <BaseButton variant="secondary" @click="addTodo">
                <template #icon>
                  <Plus />
                </template>
                Добавить
              </BaseButton>
            </div>

            <ul v-if="hasTodos" class="todo-list">
              <TodoEditorItem
                v-for="todo in draft.todos"
                :key="todo.id"
                :todo="todo"
                @toggle="toggleTodo"
                @remove="removeTodo"
                @update-text="updateTodoText"
                @commit-text="commitTodoText"
              />
            </ul>

            <div v-else class="todo-empty">
              <p>Пока нет задач</p>
              <BaseButton variant="primary" @click="addTodo">
                <template #icon>
                  <Plus />
                </template>
                Добавить задачу
              </BaseButton>
            </div>
          </div>
        </form>

        <aside class="editor-summary" aria-label="Сводка заметки">
          <div class="editor-summary__item">
            <span>Всего задач</span>
            <strong>{{ draft.todos.length }}</strong>
          </div>
          <div class="editor-summary__item">
            <span>Выполнено</span>
            <strong>{{ completedCount }}</strong>
          </div>
          <div class="editor-summary__item">
            <span>Undo</span>
            <strong>{{ canUndo ? 'Доступно' : 'Нет' }}</strong>
          </div>
          <div class="editor-summary__item">
            <span>Redo</span>
            <strong>{{ canRedo ? 'Доступно' : 'Нет' }}</strong>
          </div>
        </aside>
      </section>
    </template>

    <ConfirmDialog
      v-model="cancelDialogOpen"
      title="Отменить редактирование?"
      message="Несохраненные изменения будут сброшены, а черновик удален."
      confirm-label="Отменить"
      @confirm="cancel"
    />

    <ConfirmDialog
      v-model="deleteDialogOpen"
      title="Удалить заметку?"
      message="Заметка будет удалена из хранилища, а текущий черновик очищен."
      confirm-label="Удалить"
      danger
      @confirm="deleteCurrent"
    />

    <ConfirmDialog
      v-model="showRestorePrompt"
      title="Восстановить черновик?"
      :message="pendingDraft ? `Найден несохраненный черновик от ${new Date(pendingDraft.savedAt).toLocaleString()}.` : 'Найден несохраненный черновик.'"
      confirm-label="Восстановить"
      cancel-label="Удалить черновик"
      @confirm="restoreDraft"
      @cancel="discardDraft"
    />
  </main>
</template>

<style scoped lang="scss">
.editor-loading {
  display: grid;
  place-items: center;
  min-height: 280px;
  color: var(--muted);
}

.editor-header {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: start;
  gap: 16px;
  margin-bottom: 20px;
}

.editor-header__back {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink);
  background: var(--surface);
  outline: none;
  transition:
    transform 160ms ease,
    background 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(46, 126, 163, 0.22);
  }

  &:hover {
    border-color: #bdc8c4;
    background: #f9fbfa;
    transform: translateY(-1px);
  }

  svg {
    width: 19px;
    height: 19px;
  }
}

.editor-header__title {
  min-width: 0;
}

.editor-header__eyebrow {
  margin: 2px 0 8px;
  color: var(--accent-strong);
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

.editor-header__title .page-title {
  overflow-wrap: anywhere;
}

.editor-header__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.editor-alert {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  margin: 0 0 18px;
  border: 1px solid #e0be8b;
  border-radius: 8px;
  padding: 12px 14px;
  color: #6c420b;
  background: #fff4df;
}

.editor-alert svg {
  width: 20px;
  height: 20px;
}

.editor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  align-items: start;
  gap: 18px;
}

.editor-panel {
  display: grid;
  gap: 22px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 22px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 14px 34px rgba(38, 45, 42, 0.08);
}

.editor-title-input {
  min-height: 52px;
  font-size: 1.1rem;
  font-weight: 750;
}

.editor-panel__section {
  display: grid;
  gap: 16px;
}

.editor-panel__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.editor-panel__section-head h2 {
  margin: 0;
  font-size: 1.18rem;
  letter-spacing: 0;
}

.editor-panel__section-head p {
  margin: 6px 0 0;
  color: var(--muted);
}

.todo-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.todo-empty {
  display: grid;
  place-items: center;
  gap: 14px;
  min-height: 180px;
  border: 1px dashed #bfc9c5;
  border-radius: 8px;
  background: rgba(237, 242, 242, 0.62);
  text-align: center;
}

.todo-empty p {
  margin: 0;
  color: var(--muted);
}

.editor-summary {
  position: sticky;
  top: 18px;
  display: grid;
  gap: 10px;
}

.editor-summary__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 14px;
  background: var(--surface);
}

.editor-summary__item span {
  min-width: 0;
  color: var(--muted);
  overflow-wrap: anywhere;
}

.editor-summary__item strong {
  text-align: right;
  overflow-wrap: anywhere;
}

@media (max-width: 920px) {
  .editor-header,
  .editor-layout {
    grid-template-columns: 1fr;
  }

  .editor-header__back {
    justify-self: start;
  }

  .editor-header__actions {
    justify-content: flex-start;
  }

  .editor-summary {
    position: static;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .editor-panel {
    padding: 16px;
  }

  .editor-panel__section-head {
    align-items: stretch;
    flex-direction: column;
  }

  .editor-header__actions,
  .editor-summary {
    grid-template-columns: 1fr;
  }
}
</style>
