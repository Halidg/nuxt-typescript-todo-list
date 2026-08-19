<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    fullWidth?: boolean;
  }>(),
  {
    variant: 'secondary',
    type: 'button',
    disabled: false,
    fullWidth: false,
  },
);
</script>

<template>
  <button
    class="base-button"
    :class="[`base-button--${variant}`, { 'base-button--full': fullWidth }]"
    :type="type"
    :disabled="disabled"
  >
    <span v-if="$slots.icon" class="base-button__icon" aria-hidden="true">
      <slot name="icon" />
    </span>
    <span class="base-button__label">
      <slot />
    </span>
  </button>
</template>

<style scoped lang="scss">
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 9px 14px;
  font-weight: 800;
  line-height: 1;
  text-decoration: none;
  outline: none;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    border-color 160ms ease,
    background 160ms ease;

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(46, 126, 163, 0.22);
  }

  &:not(:disabled):hover {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.48;
  }
}

.base-button--full {
  width: 100%;
}

.base-button--primary {
  color: #fff;
  background: var(--accent);

  &:not(:disabled):hover {
    background: var(--accent-strong);
  }
}

.base-button--secondary {
  border-color: var(--line);
  color: var(--ink);
  background: var(--surface);

  &:not(:disabled):hover {
    border-color: #bdc8c4;
    background: #f9fbfa;
  }
}

.base-button--ghost {
  color: var(--ink);
  background: transparent;

  &:not(:disabled):hover {
    background: var(--surface-muted);
  }
}

.base-button--danger {
  color: #fff;
  background: var(--danger);

  &:not(:disabled):hover {
    background: #923131;
  }
}

.base-button__icon {
  display: inline-flex;
  width: 18px;
  height: 18px;
}

.base-button__label {
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>
