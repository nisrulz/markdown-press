<script setup>
import { onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import AppBar from './components/AppBar.vue'
import EditorPane from './components/EditorPane.vue'
import PreviewPane from './components/PreviewPane.vue'
import InfoScreen from './components/InfoScreen.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import SplitterBar from './components/SplitterBar.vue'
import StatusBar from './components/StatusBar.vue'
import logoUrl from '../img/logo.webp?inline'
import sample from './sample.md?raw'
import { applyPrintCss, printDocument } from './scripts/print.js'
import { documentTitle } from './scripts/preview.js'
import { hasSeenInfo, markInfoSeen } from './scripts/info-flag.js'
import { openMarkdownFile, replaceGuarded, setSource, showToast, store } from './scripts/store.js'

const fileInput = ref(null)
const editor = ref(null)
const preview = ref(null)

watchEffect(() => {
  applyPrintCss(store.settings)
})

const THEME_COLORS = { dark: '#1c1b1f', light: '#ffffff' }

watch(
  () => store.theme,
  (theme) => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
  },
  { immediate: true, flush: 'sync' },
)

function focusEditor() {
  editor.value?.focus()
}

function onOpen() {
  if (replaceGuarded()) fileInput.value?.click()
}

function onFileChange(event) {
  openMarkdownFile(event.target.files?.[0], focusEditor)
  event.target.value = ''
}

function onSample() {
  if (!replaceGuarded()) return
  setSource(sample)
  focusEditor()
}

function onClear() {
  if (!replaceGuarded()) return
  setSource('')
  focusEditor()
}

function onFormat() {
  store.settingsOpen = !store.settingsOpen
}

function onInfo() {
  store.infoOpen = true
}

function closeInfo() {
  store.infoOpen = false
  markInfoSeen()
  document.getElementById('brand-mark')?.focus()
}

async function onSave() {
  if (store.source.trim() === '') {
    showToast('Add some markdown first.')
    return
  }

  const sheet = await preview.value?.flushPreview()
  const fallback = store.fileName.replace(/\.[^.]+$/, '') || 'document'
  printDocument({ settings: store.settings, title: documentTitle(sheet, fallback) })
}

function closeSettings() {
  store.settingsOpen = false
}

function onPointerDown(event) {
  if (!store.settingsOpen) return
  if (event.target.closest?.('.settings, #btn-settings')) return
  closeSettings()
}

function hasFiles(event) {
  const types = event.dataTransfer?.types
  return Boolean(types) && Array.from(types).includes('Files')
}

let dragDepth = 0

function markDragging(on) {
  document.body.classList.toggle('is-dragging', on)
}

function onDragEnter(event) {
  if (!hasFiles(event)) return
  dragDepth += 1
  markDragging(true)
}

function onDragOver(event) {
  if (hasFiles(event)) event.preventDefault()
}

function onDragLeave(event) {
  if (!hasFiles(event)) return
  dragDepth = Math.max(0, dragDepth - 1)
  if (dragDepth === 0) markDragging(false)
}

function onDrop(event) {
  if (!hasFiles(event)) return
  event.preventDefault()
  dragDepth = 0
  markDragging(false)
  if (!replaceGuarded()) return
  openMarkdownFile(event.dataTransfer?.files?.[0], focusEditor)
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    if (store.infoOpen) closeInfo()
    else closeSettings()
    return
  }
  if (!(event.metaKey || event.ctrlKey)) return
  const key = event.key.toLowerCase()

  if (key === 's') {
    event.preventDefault()
    onSave()
  } else if (key === 'o') {
    event.preventDefault()
    onOpen()
  }
}

function onBeforeUnload(event) {
  if (store.source.trim() === '') return
  event.preventDefault()
  event.returnValue = ''
}

onMounted(() => {
  document.querySelector('link[rel="icon"]')?.setAttribute('href', logoUrl)
  if (!hasSeenInfo()) {
    markInfoSeen()
    store.infoOpen = true
  }
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('dragenter', onDragEnter)
  window.addEventListener('dragover', onDragOver)
  window.addEventListener('dragleave', onDragLeave)
  window.addEventListener('drop', onDrop)
  window.addEventListener('beforeunload', onBeforeUnload)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('dragenter', onDragEnter)
  window.removeEventListener('dragover', onDragOver)
  window.removeEventListener('dragleave', onDragLeave)
  window.removeEventListener('drop', onDrop)
  window.removeEventListener('beforeunload', onBeforeUnload)
})
</script>

<template>
  <div class="app">
    <AppBar @open="onOpen" @sample="onSample" @clear="onClear" @format="onFormat" @save="onSave" @info="onInfo" />
    <SettingsPanel />
    <InfoScreen v-if="store.infoOpen" @close="closeInfo" />

    <main class="workspace" id="workspace" :style="{ '--split': `${store.split}%` }">
      <EditorPane ref="editor" />
      <SplitterBar />
      <PreviewPane ref="preview" />
    </main>

    <StatusBar />

    <div class="drop-hint" aria-hidden="true">
      <span>Drop a markdown file to open it</span>
    </div>
    <div class="toast" id="toast" role="status" :hidden="store.toast === ''">{{ store.toast }}</div>

    <input
      ref="fileInput"
      type="file"
      id="file-input"
      accept=".md,.markdown,.mdown,.markdn,.txt,text/markdown,text/plain"
      hidden
      @change="onFileChange"
    />
  </div>
</template>
