<script setup lang="ts">
type IconButtonVariant = 'plain' | 'soft' | 'danger';

withDefaults(
  defineProps<{
    label: string;
    variant?: IconButtonVariant;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
  }>(),
  {
    variant: 'soft',
    type: 'button',
    disabled: false,
  },
);
</script>

<template>
  <button
    class="icon-button"
    :class="`icon-button--${variant}`"
    :type="type"
    :disabled="disabled"
    :aria-label="label"
    :title="label"
  >
    <slot />
  </button>
</template>

<style scoped lang="scss">
.icon-button {
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--ink);
  outline: none;
  transition:
    transform 160ms ease,
    background 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(46, 126, 163, 0.22);
  }

  &:not(:disabled):hover {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.42;
  }

  :deep(svg) {
    width: 18px;
    height: 18px;
  }
}

.icon-button--plain {
  background: transparent;

  &:not(:disabled):hover {
    background: var(--surface-muted);
  }
}

.icon-button--soft {
  border-color: var(--line);
  background: var(--surface);

  &:not(:disabled):hover {
    border-color: #bdc8c4;
    background: #f9fbfa;
  }
}

.icon-button--danger {
  color: var(--danger);
  background: var(--danger-soft);

  &:not(:disabled):hover {
    border-color: rgba(178, 59, 59, 0.28);
    background: #f0cac6;
  }
}
</style>
