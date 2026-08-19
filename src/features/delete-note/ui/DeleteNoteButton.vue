<script setup lang="ts">
import { ref } from 'vue';
import { Trash2 } from '@lucide/vue';
import type { Note } from '~/entities/note/model/types';
import { useNotesStore } from '~/entities/note/model/notesStore';
import BaseButton from '~/shared/ui/BaseButton.vue';
import IconButton from '~/shared/ui/IconButton.vue';
import ConfirmDialog from '~/shared/ui/ConfirmDialog.vue';

const props = withDefaults(
  defineProps<{
    note: Note;
    compact?: boolean;
  }>(),
  {
    compact: false,
  },
);

const emit = defineEmits<{
  deleted: [noteId: string];
}>();

const store = useNotesStore();
const isOpen = ref(false);

function confirmDelete(): void {
  store.deleteNote(props.note.id);
  emit('deleted', props.note.id);
}
</script>

<template>
  <IconButton v-if="compact" label="Удалить заметку" variant="danger" @click="isOpen = true">
    <Trash2 />
  </IconButton>

  <BaseButton v-else variant="danger" @click="isOpen = true">
    <template #icon>
      <Trash2 />
    </template>
    Удалить
  </BaseButton>

  <ConfirmDialog
    v-model="isOpen"
    title="Удалить заметку?"
    :message="`Заметка «${note.title || 'Без названия'}» исчезнет из списка. Это действие нельзя отменить после сохранения в хранилище.`"
    confirm-label="Удалить"
    danger
    @confirm="confirmDelete"
  />
</template>
