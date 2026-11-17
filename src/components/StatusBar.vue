<script setup>
import { computed } from 'vue'
import { store } from '../scripts/store.js'
import { countWords } from '../scripts/editor.js'

const words = computed(() => {
  const count = countWords(store.source)
  return `${count} ${count === 1 ? 'word' : 'words'}`
})

const characters = computed(() => {
  const count = store.source.length
  return `${count} ${count === 1 ? 'character' : 'characters'}`
})

const pages = computed(() => {
  const count = store.pageCount
  return `${count} ${count === 1 ? 'page' : 'pages'}`
})
</script>

<template>
  <footer class="statusbar">
    <div class="status-left">
      <span id="stat-words">{{ words }}</span>
      <span class="dot" aria-hidden="true">·</span>
      <span id="stat-chars">{{ characters }}</span>
      <span class="dot" aria-hidden="true">·</span>
      <span id="stat-pages">{{ pages }}</span>
    </div>
    <div class="status-right">
      <p class="support">
        <a href="https://ko-fi.com/nisrulz" target="_blank" rel="noopener noreferrer">
          Buy me a coffee
        </a>
        <span> — commits are cheap; <em>coffee isn’t.</em></span>
      </p>
    </div>
  </footer>
</template>
