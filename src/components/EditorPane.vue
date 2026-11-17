<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { store } from '../scripts/store.js'
import { indentLines, surroundSelection } from '../scripts/editor.js'

const textarea = ref(null)

const hint = /Mac|iPhone|iPad/.test(navigator.userAgent)
  ? 'Tab indents · ⌘B bold · ⌘K link'
  : 'Tab indents · Ctrl+B bold · Ctrl+K link'

function syncSource() {
  store.source = textarea.value.value
}

function indent(direction) {
  indentLines(textarea.value, direction)
  syncSource()
}

function wrapSelection(prefix, suffix = prefix, placeholder = 'text') {
  surroundSelection(textarea.value, prefix, suffix, placeholder)
  syncSource()
}

function onTab(event) {
  if (event.key !== 'Tab' || event.metaKey || event.ctrlKey || event.altKey) return
  event.preventDefault()
  indent(event.shiftKey ? -1 : 1)
}

function onDocumentKeydown(event) {
  if (!(event.metaKey || event.ctrlKey)) return
  if (document.activeElement !== textarea.value) return
  const key = event.key.toLowerCase()

  if (key === 'b') {
    event.preventDefault()
    wrapSelection('**')
  } else if (key === 'i') {
    event.preventDefault()
    wrapSelection('_')
  } else if (key === 'k') {
    event.preventDefault()
    wrapSelection('[', '](https://)', 'link text')
  }
}

function resetScroll() {
  textarea.value.scrollTop = 0
}

onMounted(() => {
  document.addEventListener('keydown', onDocumentKeydown)
  window.addEventListener('pageshow', resetScroll, { once: true })
  textarea.value.setSelectionRange(0, 0)
  textarea.value.focus()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onDocumentKeydown)
  window.removeEventListener('pageshow', resetScroll)
})

defineExpose({ focus: () => textarea.value?.focus() })
</script>

<template>
  <section class="pane editor-pane" aria-label="Markdown source">
    <div class="pane-head">
      <span>Markdown</span>
      <span class="pane-hint" id="editor-hint">{{ hint }}</span>
    </div>
    <textarea
      id="editor"
      ref="textarea"
      v-model="store.source"
      spellcheck="false"
      autocapitalize="off"
      autocomplete="off"
      placeholder="# Start here&#10;&#10;Paste markdown, or drop a .md file on this page."
      @keydown="onTab"
    ></textarea>
  </section>
</template>
