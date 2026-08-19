<script setup lang="ts">
import { computed } from 'vue';
import { useHead, useRoute } from '#imports';
import NoteEditor from '~/widgets/note-editor/ui/NoteEditor.vue';

const route = useRoute();
const noteId = computed(() => {
  const id = route.params.id;
  return Array.isArray(id) ? id[0] ?? 'new' : id ?? 'new';
});

useHead({
  title: 'Редактор заметки',
});
</script>

<template>
  <NoteEditor :note-id="noteId" />
</template>
