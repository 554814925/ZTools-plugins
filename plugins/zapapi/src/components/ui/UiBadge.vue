<template>
  <span class="ui-badge" :class="[`ui-badge--${variant}`, `ui-badge--${size}`]">
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
}>(), {
  variant: 'default',
  size: 'sm'
})
</script>

<style scoped>
.ui-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill);
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.ui-badge--sm {
  padding: 1px 6px;
  font-size: 10px;
}

.ui-badge--md {
  padding: 3px 8px;
  font-size: 11px;
}

.ui-badge--default {
  background: var(--bg-overlay);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.ui-badge--success {
  background: var(--success-glow);
  color: var(--success-color);
  border: 1px solid rgba(0, 255, 136, 0.25);
}

.ui-badge--warning {
  background: var(--warning-glow);
  color: var(--warning-color);
  border: 1px solid rgba(255, 184, 0, 0.25);
}

.ui-badge--error {
  background: var(--error-glow);
  color: var(--error-color);
  border: 1px solid rgba(255, 68, 102, 0.25);
}

.ui-badge--info {
  background: var(--info-glow);
  color: var(--info-color);
  border: 1px solid rgba(0, 229, 255, 0.25);
}
</style>
