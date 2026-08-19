import { onBeforeUnmount, onMounted } from 'vue';
import { NOTES_STORAGE_KEY, useNotesStore } from '~/entities/note/model/notesStore';

export function useNotesStorageSync(): void {
  const store = useNotesStore();
  const handleStorage = (event: StorageEvent) => {
    if (event.key === NOTES_STORAGE_KEY) {
      store.hydrate();
    }
  };

  onMounted(() => {
    store.hydrate();
    window.addEventListener('storage', handleStorage);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('storage', handleStorage);
  });
}
