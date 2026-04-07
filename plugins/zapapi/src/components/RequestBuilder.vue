<template>
  <div class="request-builder">
    <div class="request-bar">
      <UiSelect v-model="request.method" :options="methodOptions" class="request-bar__method" />
      <UiVariableInput
        v-model="request.url"
        :placeholder="t('request.urlPlaceholder')"
        class="request-bar__url"
        @keydown="(e: KeyboardEvent) => e.key === 'Enter' && $emit('send')"
      />
      <UiButton variant="primary" size="sm" class="request-bar__send" :disabled="sending || !request.url" @click="$emit('send')">
        <svg v-if="!sending" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        <svg v-else class="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
        {{ sending ? t('request.sending') : t('request.send') }}
      </UiButton>
    </div>

    <UiTabs v-model="activeTab" :tabs="currentTabs">
      <template #default="{ activeTab: tab }">
        <div v-if="tab === 'params'" class="tab-content tab-content--no-pad">
          <UiTableEditor
            :rows="request.params"
            :key-label="t('request.paramName')"
            :value-label="t('request.value')"
            key-placeholder="page"
            value-placeholder="1"
            @update:rows="(rows) => request.params = rows"
          />
        </div>
        <div v-if="tab === 'headers'" class="tab-content tab-content--no-pad">
          <UiTableEditor
            :rows="request.headers"
            :key-label="t('request.headerPlaceholder')"
            :value-label="t('request.value')"
            key-placeholder="Content-Type"
            value-placeholder="application/json"
            @update:rows="(rows) => request.headers = rows"
          />
        </div>
        <div v-if="tab === 'auth'" class="tab-content tab-content--no-pad">
          <div class="auth-editor">
            <div class="auth-type-selector">
              <div
                v-for="opt in authTypeOptions"
                :key="opt.value"
                class="auth-type-pill"
                :class="{ active: request.auth.type === opt.value }"
                @click="request.auth.type = opt.value as any"
              >
                {{ opt.label }}
              </div>
            </div>
            <div v-if="request.auth.type === 'bearer'" class="auth-fields">
              <div class="auth-field">
                <span class="auth-field__label">Token</span>
                <UiInput v-model="request.auth.token" :placeholder="t('request.bearerToken')" />
              </div>
            </div>
            <div v-if="request.auth.type === 'basic'" class="auth-fields">
              <div class="auth-field">
                <span class="auth-field__label">{{ t('request.username') }}</span>
                <UiInput v-model="request.auth.username" :placeholder="t('request.username')" />
              </div>
              <div class="auth-field">
                <span class="auth-field__label">{{ t('request.password') }}</span>
                <UiInput v-model="request.auth.password" type="password" :placeholder="t('request.password')" />
              </div>
            </div>
            <div v-if="request.auth.type === 'apikey'" class="auth-fields">
              <div class="auth-field">
                <span class="auth-field__label">Key</span>
                <UiInput v-model="request.auth.apiKey" :placeholder="t('request.apiKeyValue')" />
              </div>
              <div class="auth-field">
                <span class="auth-field__label">{{ t('request.addTo') }}</span>
                <UiSelect v-model="request.auth.apiKeyLocation" :options="apiKeyLocationOptions" />
              </div>
              <div class="auth-field">
                <span class="auth-field__label">{{ t('request.headerName') }}</span>
                <UiInput v-model="request.auth.apiKeyHeader" placeholder="X-API-Key" />
              </div>
            </div>
            <div v-if="request.auth.type === 'none'" class="auth-empty">
              {{ t('request.noAuth') }}
            </div>
          </div>
        </div>
        <div v-if="tab === 'body'" class="tab-content tab-content--no-pad">
          <div class="body-editor">
            <div class="body-type-selector">
              <div
                v-for="opt in bodyTypeOptions"
                :key="opt.value"
                class="body-type-pill"
                :class="{ active: request.body.type === opt.value }"
                @click="request.body.type = opt.value as any"
              >
                {{ opt.label }}
              </div>
            </div>
            <div v-if="request.body.type === 'json' || request.body.type === 'raw'" class="body-textarea">
              <UiTextarea
                v-model="request.body.raw"
                :placeholder="request.body.type === 'json' ? jsonPlaceholder : t('request.bodyPlaceholder')"
                :rows="8"
              />
            </div>
            <div v-if="request.body.type === 'formdata' || request.body.type === 'urlencoded'" class="body-kv">
              <UiTableEditor
                :rows="request.body.formData"
                :key-label="t('request.fieldName')"
                :value-label="t('request.value')"
                key-placeholder="field"
                value-placeholder="value"
                @update:rows="(rows) => request.body.formData = rows.map(r => ({ ...r, isFile: false }))"
              />
            </div>
            <div v-if="request.body.type === 'none'" class="auth-empty">
              {{ t('request.noBody') }}
            </div>
          </div>
        </div>
      </template>
    </UiTabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RequestState, ResponseState } from '../store/request'
import UiSelect from './ui/UiSelect.vue'
import UiInput from './ui/UiInput.vue'
import UiVariableInput from './ui/UiVariableInput.vue'
import UiButton from './ui/UiButton.vue'
import UiTabs from './ui/UiTabs.vue'
import UiTableEditor from './ui/UiTableEditor.vue'
import UiTextarea from './ui/UiTextarea.vue'
import UiTooltip from './ui/UiTooltip.vue'

const { t } = useI18n()

const props = defineProps<{
  request: RequestState
  response: ResponseState
  sending: boolean
}>()

defineEmits<{
  send: []
  save: []
}>()

const activeTab = ref('params')

const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
  { label: 'PATCH', value: 'PATCH' },
  { label: 'HEAD', value: 'HEAD' },
  { label: 'OPTIONS', value: 'OPTIONS' }
]

const authTypeOptions = computed(() => [
  { label: t('request.none'), value: 'none' },
  { label: t('request.bearer'), value: 'bearer' },
  { label: t('request.basic'), value: 'basic' },
  { label: t('request.apikey'), value: 'apikey' }
])

const apiKeyLocationOptions = [
  { label: 'Header', value: 'header' },
  { label: 'Query', value: 'query' }
]

const bodyTypeOptions = computed(() => [
  { label: t('request.bodyNone'), value: 'none' },
  { label: t('request.bodyJson'), value: 'json' },
  { label: t('request.bodyRaw'), value: 'raw' },
  { label: t('request.bodyFormdata'), value: 'formdata' },
  { label: t('request.bodyUrlencoded'), value: 'urlencoded' }
])

const jsonPlaceholder = '{\n  "key": "value"\n}'

const enabledParamsCount = computed(() => props.request.params.filter((p) => p.enabled && p.key).length)
const enabledHeadersCount = computed(() => props.request.headers.filter((h) => h.enabled && h.key).length)

const currentTabs = computed(() => [
  { key: 'params', label: t('request.params'), badge: enabledParamsCount.value },
  { key: 'headers', label: t('request.headers'), badge: enabledHeadersCount.value },
  { key: 'auth', label: t('request.auth') },
  { key: 'body', label: t('request.body') }
])
</script>

<style scoped>
.request-builder {
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 260px;
  flex-shrink: 0;
}

.request-builder :deep(.ui-tabs) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.request-builder :deep(.ui-tabs__content) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-top: var(--space-md);
}

.request-bar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  background: var(--panel-bg);
}

.request-bar__method {
  flex-shrink: 0;
}

.request-bar__url {
  flex: 1;
  min-width: 0;
}

.request-bar__send {
  margin-left: auto;
  flex-shrink: 0;
}

.tab-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.tab-content--no-pad {
  padding: 0;
}

/* Auth Editor */
.auth-editor {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  min-height: 160px;
}

.auth-type-selector {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.auth-type-pill {
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
  border-radius: var(--radius-sm);
  user-select: none;
}

.auth-type-pill:hover {
  color: var(--text-primary);
  background: var(--bg-elevated);
}

.auth-type-pill.active {
  color: var(--accent-primary);
  background: var(--bg-elevated);
}

.auth-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.auth-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.auth-field__label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
}

.auth-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  color: var(--text-muted);
  font-size: 12px;
  text-align: center;
}

/* Body Editor */
.body-editor {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.body-type-selector {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--bg-surface);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  flex-wrap: wrap;
}

.body-type-pill {
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
  border-radius: var(--radius-sm);
  user-select: none;
}

.body-type-pill:hover {
  color: var(--text-primary);
  background: var(--bg-elevated);
}

.body-type-pill.active {
  color: var(--accent-primary);
  background: var(--bg-elevated);
}

.body-textarea {
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.body-kv {
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
