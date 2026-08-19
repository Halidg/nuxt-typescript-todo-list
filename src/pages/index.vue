<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useHead } from '#imports';
import { NotebookPen } from '@lucide/vue';
import { useNotesStore } from '~/entities/note/model/notesStore';
import CreateNoteButton from '~/features/create-note/ui/CreateNoteButton.vue';
import NotesList from '~/widgets/notes-list/ui/NotesList.vue';
import BaseLinkButton from '~/shared/ui/BaseLinkButton.vue';

const store = useNotesStore();
const notes = computed(() => store.orderedNotes);

useHead({
  title: 'Заметки Todo',
});

onMounted(() => {
  if (!store.hydrated) {
    store.hydrate();
  }
});
</script>

<template>
  <main class="page-shell">
    <header class="page-topbar">
      <div>
        <h1 class="page-title">Заметки Todo</h1>
        <p class="page-subtitle">Список заметок с коротким превью задач и быстрым доступом к редактированию.</p>
      </div>
      <CreateNoteButton />
    </header>

    <NotesList v-if="notes.length > 0" :notes="notes" />

    <section v-else class="empty-state">
      <div class="empty-state__inner">
        <NotebookPen aria-hidden="true" class="home-empty__icon" />
        <h2>Пока нет заметок</h2>
        <p>Создайте первую заметку и добавьте в нее задачи.</p>
        <BaseLinkButton to="/notes/new" variant="primary">
          Новая заметка
        </BaseLinkButton>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
.home-empty__icon {
  width: 42px;
  height: 42px;
  margin-bottom: 18px;
  color: var(--accent);
}

</style>
