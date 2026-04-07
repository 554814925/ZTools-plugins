<template>
  <div
    class="ui-button"
    :class="[
      `ui-button--${variant}`,
      `ui-button--${size}`,
      { 'ui-button--disabled': disabled, 'ui-button--icon': iconOnly }
    ]"
    :tabindex="disabled ? -1 : 0"
    role="button"
    @click="!disabled && $emit('click', $event)"
    @keydown.enter="!disabled && $emit('click', $event)"
    @keydown.space.prevent="!disabled && $emit('click', $event)"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning'
  size?: 'xs' | 'sm' | 'md'
  disabled?: boolean
  iconOnly?: boolean
}>()

defineEmits<{
  click: [event: MouseEvent | KeyboardEvent]
}>()
</script>

<style scoped>
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  outline: none;
  border: 1px solid transparent;
  transition: all var(--transition-base);
  letter-spacing: 0.01em;
}

.ui-button:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.ui-button--primary {
  background: var(--accent-primary);
  color: var(--bg-deep);
  border-color: var(--accent-primary);
  box-shadow: 0 0 12px var(--accent-glow);
}

.ui-button--primary:hover:not(.ui-button--disabled) {
  background: #33EBFF;
  border-color: #33EBFF;
  box-shadow: 0 0 20px var(--accent-glow-strong);
  transform: translateY(-1px);
}

.ui-button--primary:active:not(.ui-button--disabled) {
  transform: translateY(0);
  box-shadow: 0 0 8px var(--accent-glow);
}

.ui-button--secondary {
  background: var(--bg-surface);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.ui-button--secondary:hover:not(.ui-button--disabled) {
  background: var(--bg-elevated);
  border-color: var(--border-color-hover);
  transform: translateY(-1px);
}

.ui-button--secondary:active:not(.ui-button--disabled) {
  transform: translateY(0);
}

.ui-button--ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: transparent;
}

.ui-button--ghost:hover:not(.ui-button--disabled) {
  background: var(--bg-surface);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.ui-button--danger {
  background: transparent;
  color: var(--error-color);
  border-color: transparent;
}

.ui-button--danger:hover:not(.ui-button--disabled) {
  background: var(--error-glow);
  border-color: var(--error-color);
}

.ui-button--success {
  background: transparent;
  color: var(--success-color);
  border-color: transparent;
}

.ui-button--success:hover:not(.ui-button--disabled) {
  background: var(--success-glow);
  border-color: var(--success-color);
}

.ui-button--warning {
  background: transparent;
  color: var(--warning-color);
  border-color: transparent;
}

.ui-button--warning:hover:not(.ui-button--disabled) {
  background: var(--warning-glow);
  border-color: var(--warning-color);
}

.ui-button--xs {
  padding: 2px 6px;
  font-size: 10px;
}

.ui-button--sm {
  padding: 5px 10px;
  font-size: 12px;
}

.ui-button--md {
  padding: 7px 14px;
  font-size: 13px;
}

.ui-button--icon {
  width: 28px;
  height: 28px;
  padding: 0;
  min-width: 28px;
  min-height: 28px;
}

.ui-button--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
