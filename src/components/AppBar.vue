<script setup>
import { computed } from 'vue'
import BrandMark from './BrandMark.vue'
import { store, toggleTheme } from '../scripts/store.js'

const emit = defineEmits(['open', 'sample', 'clear', 'format', 'save', 'info'])

const themeLabel = computed(() => `Switch to ${store.theme === 'dark' ? 'light' : 'dark'} theme`)
</script>

<template>
  <header class="appbar">
    <BrandMark @info="emit('info')" />

    <div class="appbar-actions">
      <div class="btn-group" role="group" aria-label="Document">
        <button class="btn" type="button" id="btn-open" @click="emit('open')">Open</button>
        <button class="btn" type="button" id="btn-sample" @click="emit('sample')">Sample</button>
        <button class="btn" type="button" id="btn-clear" @click="emit('clear')">Clear</button>
      </div>

      <button
        class="btn btn-theme"
        type="button"
        id="btn-theme"
        :aria-label="themeLabel"
        :aria-pressed="String(store.theme === 'dark')"
        :title="themeLabel"
        @click="toggleTheme"
      >
        <svg class="btn-glyph theme-icon-moon" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M13.2 10.7A6.2 6.2 0 0 1 5.3 2.8a6.2 6.2 0 1 0 7.9 7.9Z"
            fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
        </svg>
        <svg class="btn-glyph theme-icon-sun" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="2.8" fill="none" stroke="currentColor" stroke-width="1.4" />
          <path d="M8 1.5v1.4m0 10.2v1.4m6.5-6.5h-1.4M2.9 8H1.5m11.1-4.6-1 1m-7.2 7.2-1 1m9.2 0-1-1m-7.2-7.2-1-1"
            fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        </svg>
      </button>

      <button
        class="btn"
        type="button"
        id="btn-settings"
        :aria-expanded="String(store.settingsOpen)"
        aria-controls="settings"
        @click="emit('format')"
      >
        <svg class="btn-glyph" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M2 5h5.5M12.5 5H14M2 11h1.5M8.5 11H14"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <circle cx="10" cy="5" r="1.8" stroke="currentColor" stroke-width="1.5"
            fill="none" />
          <circle cx="6" cy="11" r="1.8" stroke="currentColor" stroke-width="1.5"
            fill="none" />
        </svg>
        Format
      </button>

      <button
        class="btn btn-primary"
        type="button"
        id="btn-pdf"
        title="Open the print dialog, then choose Save as PDF"
        @click="emit('save')"
      >
        <svg class="btn-glyph" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M4.5 5.5v-3h7v3M4.5 12.5h-2v-5h11v5h-2M4.5 10h7v3.5h-7z"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linejoin="round"
            fill="none"
          />
        </svg>
        Save PDF
      </button>
    </div>
  </header>
</template>
