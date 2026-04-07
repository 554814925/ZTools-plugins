<template>
  <div class="zapapi-app">
    <div class="zapapi-header">
      <div class="zapapi-logo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        <span>ZapApi</span>
      </div>
      <div class="zapapi-env-selector">
        <span class="zapapi-env-label">{{ t('app.env') }}</span>
        <UiSelect
          v-model="activeEnvId"
          :options="envOptions"
          :placeholder="t('app.noEnv')"
        />
        <UiTooltip :content="t('app.manageEnv')" placement="bottom">
          <UiButton variant="ghost" size="sm" icon-only @click="showEnvManager = true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
          </UiButton>
        </UiTooltip>
      </div>
      <div class="zapapi-actions">
        <UiButton variant="secondary" size="sm" :disabled="!requestStore.request.url" @click="showCodeGenerator = true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
          {{ t('app.code') }}
        </UiButton>
        <UiTooltip :content="t('common.settings')" placement="bottom">
          <UiButton variant="ghost" size="sm" icon-only @click="showSettings = true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </UiButton>
        </UiTooltip>
      </div>
    </div>
    <div class="zapapi-body">
      <Sidebar
        :active-collection="activeCollectionId"
        :active-request="activeRequestId"
        :collapsed="sidebarCollapsed"
        @select-request="onSelectRequest"
        @new-request="onNewRequest"
        @new-collection="onNewCollection"
        @toggle="sidebarCollapsed = !sidebarCollapsed"
        @manage-collections="showCollectionManager = true"
      />
      <div class="zapapi-main">
        <RequestBuilder
          :request="requestStore.request"
          :response="requestStore.response"
          :sending="sending"
          @send="onSend"
          @save="onSave"
        />
        <ResponseViewer
          v-if="sending || requestStore.response.status !== null || requestStore.response.error"
          :response="requestStore.response"
          :sending="sending"
        />
      </div>
    </div>

    <UiModal v-if="showEnvManager" :title="t('app.envManagerTitle')" size="lg" @close="showEnvManager = false">
      <EnvironmentManager />
    </UiModal>
    <UiModal v-if="showCodeGenerator" :title="t('app.codeGeneratorTitle')" size="md" @close="showCodeGenerator = false">
      <CodeGenerator />
    </UiModal>
    <UiModal v-if="showCollectionManager" :title="t('app.collectionManagerTitle')" size="md" @close="showCollectionManager = false">
      <CollectionManager />
    </UiModal>
    <SettingsModal v-if="showSettings" @close="showSettings = false" />
    <UiToast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Sidebar from './components/Sidebar.vue'
import RequestBuilder from './components/RequestBuilder.vue'
import ResponseViewer from './components/ResponseViewer.vue'
import EnvironmentManager from './components/EnvironmentManager.vue'
import CodeGenerator from './components/CodeGenerator.vue'
import CollectionManager from './components/CollectionManager.vue'
import SettingsModal from './components/SettingsModal.vue'
import UiSelect from './components/ui/UiSelect.vue'
import UiButton from './components/ui/UiButton.vue'
import UiModal from './components/ui/UiModal.vue'
import UiToast from './components/ui/UiToast.vue'
import UiTooltip from './components/ui/UiTooltip.vue'
import { useRequestStore } from './store/request'
import { useEnvironmentStore } from './store/environments'
import { useCollectionsStore } from './store/collections'
import { useHistoryStore } from './store/history'
import { sendRequest } from './utils/requestExecutor'

const { t } = useI18n()

const requestStore = useRequestStore()
const envStore = useEnvironmentStore()
const collectionsStore = useCollectionsStore()
const historyStore = useHistoryStore()
const toastRef = ref<InstanceType<typeof UiToast> | null>(null)

const activeCollectionId = ref<string | null>(null)
const activeRequestId = ref<string | null>(null)
const sending = ref(false)
const showEnvManager = ref(false)
const showCodeGenerator = ref(false)
const showCollectionManager = ref(false)
const showSettings = ref(false)
const sidebarCollapsed = ref(false)

const envOptions = computed(() => {
  return envStore.state.environments.map((e) => ({ label: e.name, value: e.id }))
})

const activeEnvId = computed({
  get: () => envStore.state.activeEnvId,
  set: (val: string | null) => envStore.setActiveEnv(val)
})

function toast(msg: string) {
  if (toastRef.value) toastRef.value.success(msg)
  else window.ztools.showTip(msg)
}

function onSelectRequest(collectionId: string, requestId: string) {
  activeCollectionId.value = collectionId
  activeRequestId.value = requestId
  const collection = collectionsStore.state.collections.find((c) => c.id === collectionId)
  if (collection) {
    const request = collection.requests.find((r) => r.id === requestId)
    if (request) {
      requestStore.loadRequest(request as any)
    }
  }
}

function onNewRequest(collectionId: string) {
  const newReq = collectionsStore.addRequest(collectionId, {
    name: t('app.newRequest'),
    method: 'GET',
    url: '',
    params: [],
    headers: [],
    auth: { type: 'none', token: '', username: '', password: '', apiKey: '', apiKeyLocation: 'header', apiKeyHeader: '' },
    body: { type: 'none', raw: '', formData: [] }
  })
  activeCollectionId.value = collectionId
  activeRequestId.value = newReq.id
  requestStore.loadRequest(newReq as any)
}

function onNewCollection() {
  const name = `${t('collection.defaultName')} ${collectionsStore.state.collections.length + 1}`
  collectionsStore.createCollection(name)
}

async function onSend() {
  if (!requestStore.request.url) return
  sending.value = true
  requestStore.resetResponse()

  const variables = envStore.getVariables()
  const snapshot = requestStore.getRequestSnapshot()

  historyStore.addItem({
    method: snapshot.method,
    url: snapshot.url,
    params: snapshot.params,
    headers: snapshot.headers,
    auth: snapshot.auth,
    body: snapshot.body
  })

  try {
    const result = await sendRequest(snapshot, variables)
    requestStore.setResponse({
      status: result.status,
      statusText: result.statusText,
      time: result.time,
      size: result.size,
      headers: result.headers,
      body: result.body,
      raw: result.body,
      error: result.error
    })
  } catch (error: unknown) {
    requestStore.setResponse({
      error: error instanceof Error ? error.message : t('response.failed')
    })
  } finally {
    sending.value = false
  }
}

function onSave() {
  if (activeCollectionId.value && activeRequestId.value) {
    collectionsStore.updateRequest(activeCollectionId.value, activeRequestId.value, {
      ...requestStore.getRequestSnapshot()
    })
    toast(t('app.saved'))
  }
}

watch(
  () => requestStore.request,
  () => {
    if (activeCollectionId.value && activeRequestId.value) {
      collectionsStore.updateRequest(activeCollectionId.value, activeRequestId.value, {
        ...requestStore.getRequestSnapshot()
      })
    }
  },
  { deep: true }
)

window.ztools?.onPluginEnter((action: any) => {
  if (action.code === 'import' && action.files && action.files.length > 0) {
    try {
      const content = window.services.readFile(action.files[0])
      const data = JSON.parse(content)
      if (Array.isArray(data) && data[0] && 'requests' in data[0]) {
        collectionsStore.importCollections(content)
        toast(t('app.importSuccess'))
      } else if (Array.isArray(data) && data[0] && 'variables' in data[0]) {
        envStore.importEnvironments(content)
        toast(t('app.envImportSuccess'))
      }
    } catch {
      toast(t('app.importFail'))
    }
  }
})
</script>

<style scoped>
.zapapi-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-deep);
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.zapapi-header {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  background: var(--header-bg);
  backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--border-color);
}

.zapapi-logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-weight: 700;
  font-size: 15px;
  color: var(--accent-primary);
  letter-spacing: -0.02em;
  text-shadow: 0 0 20px var(--accent-glow);
}

.zapapi-env-selector {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-left: auto;
}

.zapapi-env-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.zapapi-actions {
  display: flex;
  gap: var(--space-sm);
}

.zapapi-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.zapapi-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
</style>
