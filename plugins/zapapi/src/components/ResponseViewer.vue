<template>
  <div class="response-viewer">
    <div class="response-header">
      <span class="response-title">{{ t('response.title') }}</span>
      <div v-if="response.status !== null" class="response-meta">
        <span class="meta-item"><span class="meta-label">{{ t('response.statusLabel') }}</span><UiBadge :variant="statusVariant" size="sm">{{ response.status }} {{ response.statusText }}</UiBadge></span>
        <span class="meta-divider"></span>
        <span class="meta-item"><span class="meta-label">{{ t('response.timeLabel') }}</span>{{ response.time }}ms</span>
        <span class="meta-divider"></span>
        <span class="meta-item"><span class="meta-label">{{ t('response.sizeLabel') }}</span>{{ formatSize(response.size) }}</span>
      </div>
      <div v-if="response.error" class="response-error">
        {{ response.error }}
      </div>
    </div>
    <UiTabs v-model="activeTab" :tabs="tabs">
      <template #default="{ activeTab: tab }">
        <div v-if="sending" class="response-loading">
          <svg class="spinner" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
          <span>{{ t('response.waiting') }}</span>
        </div>
        <div v-else-if="response.error" class="response-error-body">
          <p>{{ t('response.failed') }}</p>
          <p>{{ response.error }}</p>
        </div>
        <UiEmpty v-else-if="response.status === null" :text="t('response.empty')" />
        <template v-else>
          <div v-if="tab === 'body'" class="response-body">
            <pre v-if="formattedBody" v-html="highlightedBody" class="code-highlight"></pre>
            <pre v-else v-html="highlightedRaw || escapeHtml(response.body || t('response.emptyBody'))" class="code-highlight"></pre>
          </div>
          <div v-if="tab === 'headers'" class="response-headers">
            <div v-for="(value, key) in response.headers" :key="key" class="header-row">
              <span class="header-key">{{ key }}</span>
              <span class="header-value">{{ value }}</span>
            </div>
          </div>
          <div v-if="tab === 'raw'" class="response-raw">
            <pre v-html="highlightedRaw || escapeHtml(response.raw)" class="code-highlight"></pre>
          </div>
        </template>
      </template>
    </UiTabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ResponseState } from '../store/request'
import UiTabs from './ui/UiTabs.vue'
import UiBadge from './ui/UiBadge.vue'
import UiEmpty from './ui/UiEmpty.vue'
import { highlight } from '../utils/syntaxHighlight'

const { t } = useI18n()

const props = defineProps<{
  response: ResponseState
  sending: boolean
}>()

const activeTab = ref('body')

const tabs = computed(() => [
  { key: 'body', label: t('response.body') },
  { key: 'headers', label: t('response.headers') },
  { key: 'raw', label: t('response.raw') }
])

const statusVariant = computed(() => {
  const status = props.response.status
  if (!status) return 'info'
  if (status >= 200 && status < 300) return 'success'
  if (status >= 300 && status < 400) return 'warning'
  return 'error'
})

const formattedBody = computed(() => {
  if (!props.response.body) return ''
  try {
    const parsed = JSON.parse(props.response.body)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return ''
  }
})

const highlightedBody = computed(() => {
  if (!props.response.body) return ''
  const ct = props.response.headers?.['content-type'] || ''
  return highlight(props.response.body, ct)
})

const highlightedRaw = computed(() => {
  if (!props.response.raw) return ''
  const ct = props.response.headers?.['content-type'] || ''
  return highlight(props.response.raw, ct)
})

function formatSize(bytes: number | null): string {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
</script>

<style scoped>
.response-viewer {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.response-viewer :deep(.ui-tabs) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.response-viewer :deep(.ui-tabs__content) {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-top: var(--space-md);
  padding-bottom: var(--space-md);
}

.response-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-surface);
}

.response-title {
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.02em;
  color: var(--text-primary);
}

.response-meta {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-left: auto;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
}

.meta-label {
  font-family: inherit;
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
}

.meta-divider {
  width: 1px;
  height: 14px;
  background: var(--border-color);
}

.response-error {
  font-size: 12px;
  color: var(--error-color);
  margin-left: auto;
  font-weight: 500;
}

.response-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-2xl);
  color: var(--text-secondary);
  font-size: 13px;
}

.spinner {
  animation: spin 0.8s linear infinite;
  color: var(--accent-primary);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.response-error-body {
  padding: var(--space-lg);
  color: var(--error-color);
  font-size: 13px;
}

.response-error-body p {
  margin: 4px 0;
}

.response-body pre,
.response-raw pre {
  margin: 0;
  padding: var(--space-md);
  background: var(--code-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--text-primary);
}

.code-highlight {
  cursor: text;
}

.response-headers {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-row {
  display: flex;
  gap: var(--space-sm);
  padding: 6px 8px;
  font-size: 12px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.header-row:hover {
  background: var(--bg-surface);
}

.header-key {
  color: var(--accent-primary);
  font-weight: 500;
  min-width: 160px;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
}

.header-value {
  color: var(--text-primary);
  word-break: break-all;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
}
</style>
