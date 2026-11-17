import { reactive } from 'vue'
import { clamp, DEFAULT_SETTINGS, normalizeSettings } from './settings.js'
import sample from '../sample.md?raw'

export const RENDER_DELAY_MS = 120
const MAX_FILE_BYTES = 5 * 1024 * 1024

export const store = reactive({
  source: sample,
  fileName: '',
  settings: { ...DEFAULT_SETTINGS },
  theme: 'dark',
  settingsOpen: false,
  infoOpen: false,
  split: 50,
  pageCount: 1,
  toast: '',
})

let toastTimer = 0

export function setSource(text, fileName = '') {
  store.source = text
  store.fileName = fileName
}

export function replaceGuarded() {
  if (store.source.trim() === '') return true
  return window.confirm('Replace the current text? This tab does not save drafts.')
}

export function showToast(message, duration = 5000) {
  store.toast = message
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    store.toast = ''
  }, duration)
}

export function toggleTheme() {
  store.theme = store.theme === 'dark' ? 'light' : 'dark'
}

export function setSplit(percent) {
  store.split = clamp(percent, 25, 75)
}

export function updateSettings(raw) {
  store.settings = normalizeSettings(raw)
}

export async function openMarkdownFile(file, done) {
  if (!file) return
  if (file.size > MAX_FILE_BYTES) {
    showToast('That file is larger than 5 MB.')
    return
  }
  setSource(await file.text(), file.name ?? '')
  done?.()
}
