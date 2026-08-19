<script setup lang="ts">
import { useNotesStorageSync } from '~/app/providers/useNotesStorageSync';

useNotesStorageSync();
</script>

<template>
  <NuxtPage />
</template>
