<template>
  <Teleport to="body">
    <div class="ui-modal-overlay" @click.self="onOverlayClick">
      <div class="ui-modal" :class="[`ui-modal--${props.size}`]" role="dialog" aria-modal="true">
        <div class="ui-modal__header">
          <h3 class="ui-modal__title">{{ props.title }}</h3>
          <UiButton variant="ghost" size="sm" icon-only @click="$emit('close')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </UiButton>
        </div>
        <div class="ui-modal__body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="ui-modal__footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import UiButton from './UiButton.vue'

const props = withDefaults(defineProps<{
  title: string
  size?: 'sm' | 'md' | 'lg'
  closeOnOverlay?: boolean
}>(), {
  size: 'md',
  closeOnOverlay: true
})

const emit = defineEmits<{
  close: []
}>()

function onOverlayClick() {
  if (props.closeOnOverlay) emit('close')
}
</script>

<style scoped>
.ui-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
  animation: overlayIn 0.2s ease;
}

@keyframes overlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ui-modal {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg), 0 0 40px rgba(0, 229, 255, 0.05);
  animation: modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

@keyframes modalIn {
  from { opacity: 0; transform: scale(0.96) translateY(12px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.ui-modal--sm {
  width: 440px;
  max-width: 90vw;
  height: 340px;
  max-height: 80vh;
}

.ui-modal--md {
  width: 640px;
  max-width: 90vw;
  height: 480px;
  max-height: 80vh;
}

.ui-modal--lg {
  width: 860px;
  max-width: 90vw;
  height: 580px;
  max-height: 85vh;
}

.ui-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  background: var(--bg-elevated);
}

.ui-modal__title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.01em;
}

.ui-modal__body {
  flex: 1;
  overflow: auto;
  padding: 18px;
}

.ui-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding: 14px 18px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
  background: var(--bg-elevated);
}
</style>
