<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import BaseButton from './BaseButton.vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
  }>(),
  {
    confirmLabel: 'Подтвердить',
    cancelLabel: 'Отмена',
    danger: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
  cancel: [];
}>();

const panelRef = ref<HTMLElement | null>(null);
const titleId = `confirm-dialog-title-${Math.random().toString(36).slice(2, 10)}`;
let previouslyFocused: HTMLElement | null = null;

function getFocusableElements(): HTMLElement[] {
  const panel = panelRef.value;
  if (!panel) {
    return [];
  }

  return Array.from(
    panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1);
}

function closeWithCancel(): void {
  emit('update:modelValue', false);
  emit('cancel');
}

function confirm(): void {
  emit('update:modelValue', false);
  emit('confirm');
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeWithCancel();
    return;
  }

  if (event.key !== 'Tab') {
    return;
  }

  const focusable = getFocusableElements();
  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (!first || !last) {
    return;
  }

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      await nextTick();
      getFocusableElements()[0]?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previouslyFocused?.focus();
      previouslyFocused = null;
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="modelValue" class="dialog" role="presentation" @keydown="handleKeydown">
        <button class="dialog__backdrop" type="button" aria-label="Закрыть окно" @click="closeWithCancel" />
        <section
          ref="panelRef"
          class="dialog__panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <h2 :id="titleId" class="dialog__title">{{ title }}</h2>
          <p class="dialog__message">{{ message }}</p>
          <div class="dialog__actions">
            <BaseButton variant="secondary" @click="closeWithCancel">
              {{ cancelLabel }}
            </BaseButton>
            <BaseButton :variant="danger ? 'danger' : 'primary'" @click="confirm">
              {{ confirmLabel }}
            </BaseButton>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.dialog {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 20px;
}

.dialog__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(18, 25, 24, 0.48);
}

.dialog__panel {
  position: relative;
  z-index: 1;
  width: min(430px, 100%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  padding: 24px;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.dialog__title {
  margin: 0;
  font-size: 1.28rem;
  line-height: 1.25;
  letter-spacing: 0;
}

.dialog__message {
  margin: 12px 0 0;
  color: var(--muted);
  line-height: 1.55;
}

.dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 150ms ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

@media (max-width: 520px) {
  .dialog__actions {
    align-items: stretch;
    flex-direction: column-reverse;
  }
}
</style>
