<script setup lang="ts">
import { Plus } from '@lucide/vue';
import BaseLinkButton from '~/shared/ui/BaseLinkButton.vue';
</script>

<template>
  <BaseLinkButton to="/notes/new" variant="primary" full-width>
    <template #icon>
      <Plus />
    </template>
    Новая заметка
  </BaseLinkButton>
</template>

<style scoped lang="scss">
@media (max-width: 720px) {
  :deep(.link-button) {
    width: 100%;
  }
}
</style>
