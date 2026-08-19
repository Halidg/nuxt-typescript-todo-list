<script setup lang="ts">
type LinkButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

withDefaults(
  defineProps<{
    to: string;
    variant?: LinkButtonVariant;
    fullWidth?: boolean;
  }>(),
  {
    variant: 'secondary',
    fullWidth: false,
  },
);
</script>

<template>
  <NuxtLink class="link-button" :class="[`link-button--${variant}`, { 'link-button--full': fullWidth }]" :to="to">
    <span v-if="$slots.icon" class="link-button__icon" aria-hidden="true">
      <slot name="icon" />
    </span>
    <span class="link-button__label">
      <slot />
    </span>
  </NuxtLink>
</template>

<style scoped lang="scss">
.link-button {
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

  &:hover {
    transform: translateY(-1px);
  }
}

.link-button--full {
  width: 100%;
}

.link-button--primary {
  color: #fff;
  background: var(--accent);

  &:hover {
    background: var(--accent-strong);
  }
}

.link-button--secondary {
  border-color: var(--line);
  color: var(--ink);
  background: var(--surface);

  &:hover {
    border-color: #bdc8c4;
    background: #f9fbfa;
  }
}

.link-button--ghost {
  color: var(--ink);
  background: transparent;

  &:hover {
    background: var(--surface-muted);
  }
}

.link-button--danger {
  color: #fff;
  background: var(--danger);

  &:hover {
    background: #923131;
  }
}

.link-button__icon {
  display: inline-flex;
  width: 18px;
  height: 18px;
}

.link-button__label {
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>
