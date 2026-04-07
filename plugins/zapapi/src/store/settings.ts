import { ref, watch } from 'vue'

export type ThemeMode = 'system' | 'dark' | 'light'

interface SettingsState {
  theme: ThemeMode
}

const STORAGE_KEY = 'zapapi-settings'

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        theme: ['system', 'dark', 'light'].includes(parsed.theme) ? parsed.theme : 'system'
      }
    }
  } catch {}
  return { theme: 'system' }
}

function saveSettings(state: SettingsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  if (theme === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', theme)
  }
}

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const state = ref<SettingsState>(loadSettings())

applyTheme(state.value.theme)

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (state.value.theme === 'system') {
    applyTheme('system')
  }
})

export function useSettingsStore() {
  function setTheme(theme: ThemeMode) {
    state.value.theme = theme
    applyTheme(theme)
    saveSettings(state.value)
  }

  function getTheme(): ThemeMode {
    return state.value.theme
  }

  function getActualTheme(): 'dark' | 'light' {
    if (state.value.theme === 'system') {
      return getSystemTheme()
    }
    return state.value.theme
  }

  return {
    state,
    setTheme,
    getTheme,
    getActualTheme
  }
}
