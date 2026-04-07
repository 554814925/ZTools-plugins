<template>
  <div class="ui-tabs">
    <div class="ui-tabs__list">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="ui-tabs__tab"
        :class="{ 'ui-tabs__tab--active': modelValue === tab.key }"
        @click="$emit('update:modelValue', tab.key)"
      >
        {{ tab.label }}
        <span v-if="tab.badge !== undefined && tab.badge > 0" class="ui-tabs__badge">
          {{ tab.badge }}
        </span>
      </div>
    </div>
    <div class="ui-tabs__content">
      <slot :active-tab="modelValue" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  key: string
  label: string
  badge?: number
}

defineProps<{
  modelValue: string
  tabs: Tab[]
}>()

defineEmits<{
  'update:modelValue': [key: string]
}>()
</script>

<style scoped>
.ui-tabs {
  display: flex;
  flex-direction: column;
}

.ui-tabs__list {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.ui-tabs__tab {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
  user-select: none;
  border-radius: var(--radius-sm);
}

.ui-tabs__tab:hover {
  color: var(--text-primary);
  background: var(--bg-elevated);
}

.ui-tabs__tab--active {
  color: var(--accent-primary);
  background: var(--bg-elevated);
}

.ui-tabs__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: var(--radius-pill);
  background: var(--accent-primary);
  color: var(--bg-deep);
  font-size: 9px;
  font-weight: 700;
}

.ui-tabs__content {
  padding-top: var(--space-md);
}
</style>
