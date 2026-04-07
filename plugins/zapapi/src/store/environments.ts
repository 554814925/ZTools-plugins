import { reactive, watch } from 'vue'

const STORAGE_KEY = 'zapapi_environments'
const ACTIVE_KEY = 'zapapi_active_env'

export interface Environment {
  id: string
  name: string
  variables: Array<{ key: string; value: string }>
}

interface EnvironmentVariable {
  key: string
  value: string
}

function normalizeVariables(variables: unknown): EnvironmentVariable[] {
  if (!Array.isArray(variables)) return []

  return variables
    .filter((item): item is { key?: unknown; value?: unknown; enabled?: unknown } => item !== null && typeof item === 'object')
    .map((item) => ({
      key: typeof item.key === 'string' ? item.key : '',
      value: typeof item.value === 'string' ? item.value : ''
    }))
}

function normalizeEnvironment(env: unknown): Environment | null {
  if (env === null || typeof env !== 'object') return null

  const item = env as { id?: unknown; name?: unknown; variables?: unknown }
  if (typeof item.id !== 'string' || typeof item.name !== 'string') return null

  return {
    id: item.id,
    name: item.name,
    variables: normalizeVariables(item.variables)
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

function loadFromStorage(): Environment[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []

    const parsed = JSON.parse(data)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((env) => normalizeEnvironment(env))
      .filter((env): env is Environment => env !== null)
  } catch {
    return []
  }
}

function loadActiveId(): string | null {
  return localStorage.getItem(ACTIVE_KEY)
}

function saveToStorage(envs: Environment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(envs))
}

function saveActiveId(id: string | null) {
  if (id) localStorage.setItem(ACTIVE_KEY, id)
  else localStorage.removeItem(ACTIVE_KEY)
}

const state = reactive({
  environments: loadFromStorage() as Environment[],
  activeEnvId: loadActiveId() as string | null
})

watch(
  () => state.environments,
  (val) => saveToStorage(val),
  { deep: true }
)

watch(
  () => state.activeEnvId,
  (val) => saveActiveId(val)
)

export function useEnvironmentStore() {
  function createEnvironment(name: string): Environment {
    const env: Environment = {
      id: generateId(),
      name,
      variables: []
    }
    state.environments.push(env)
    state.activeEnvId = env.id
    return env
  }

  function updateEnvironment(id: string, data: Partial<Environment>) {
    const index = state.environments.findIndex((e) => e.id === id)
    if (index !== -1) {
      const existing = state.environments[index]
      Object.assign(existing, data)
    }
  }

  function deleteEnvironment(id: string) {
    state.environments = state.environments.filter((e) => e.id !== id)
    if (state.activeEnvId === id) {
      state.activeEnvId = state.environments.length > 0 ? state.environments[0].id : null
    }
  }

  function setActiveEnv(id: string | null) {
    state.activeEnvId = id
  }

  function getActiveEnv(): Environment | null {
    if (!state.activeEnvId) {
      if (state.environments.length > 0) {
        state.activeEnvId = state.environments[0].id
        return state.environments[0]
      }
      return null
    }
    const env = state.environments.find((e) => e.id === state.activeEnvId)
    if (!env) {
      state.activeEnvId = state.environments.length > 0 ? state.environments[0].id : null
      return state.environments.length > 0 ? state.environments[0] : null
    }
    return env
  }

  function getVariables(): Record<string, string> {
    const env = getActiveEnv()
    if (!env) return {}
    const vars: Record<string, string> = {}
    env.variables
      .filter((v) => v.key)
      .forEach((v) => {
        const rawKey = v.key.trim()
        if (!rawKey) return

        const normalizedKey = rawKey
          .replace(/^\{\{\s*/, '')
          .replace(/\s*\}\}$/, '')
          .replace(/^\{\s*/, '')
          .replace(/\s*\}$/, '')

        if (!normalizedKey) return
        vars[normalizedKey] = v.value
      })
    return vars
  }

  function exportEnvironments(): string {
    return JSON.stringify(state.environments, null, 2)
  }

  function importEnvironments(json: string) {
    const data = JSON.parse(json)
    if (Array.isArray(data)) {
      state.environments = data
        .map((env) => normalizeEnvironment(env))
        .filter((env): env is Environment => env !== null)

      const activeExists = state.activeEnvId
        ? state.environments.some((env) => env.id === state.activeEnvId)
        : false
      if (!activeExists) {
        state.activeEnvId = state.environments.length > 0 ? state.environments[0].id : null
      }
    }
  }

  return {
    state,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    setActiveEnv,
    getActiveEnv,
    getVariables,
    exportEnvironments,
    importEnvironments
  }
}
