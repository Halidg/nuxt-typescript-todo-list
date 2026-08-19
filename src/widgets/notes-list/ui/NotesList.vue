<script setup lang="ts">
import { Edit3 } from '@lucide/vue';
import type { Note } from '~/entities/note/model/types';
import NotePreviewCard from '~/entities/note/ui/NotePreviewCard.vue';
import DeleteNoteButton from '~/features/delete-note/ui/DeleteNoteButton.vue';

defineProps<{
  notes: Note[];
}>();
</script>

<template>
  <div class="notes-grid">
    <NotePreviewCard v-for="note in notes" :key="note.id" :note="note">
      <template #actions="{ note: currentNote }">
        <div class="notes-grid__actions">
          <NuxtLink class="notes-grid__edit" :to="`/notes/${currentNote.id}`" aria-label="Изменить заметку">
            <Edit3 aria-hidden="true" />
          </NuxtLink>
          <DeleteNoteButton :note="currentNote" compact />
        </div>
      </template>
    </NotePreviewCard>
  </div>
</template>

<style scoped lang="scss">
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 290px), 1fr));
  gap: 16px;
}

.notes-grid__actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.notes-grid__edit {
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
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
    width: 18px;
    height: 18px;
  }
}
</style>
