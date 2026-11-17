<script setup>
import { store, updateSettings } from '../scripts/store.js'

function close() {
  store.settingsOpen = false
  document.getElementById('btn-settings')?.focus()
}

function update(patch) {
  updateSettings({ ...store.settings, ...patch })
}
</script>

<template>
  <div class="settings" id="settings" :hidden="!store.settingsOpen">
    <div class="settings-head">
      <h2 class="settings-title">Page format</h2>
      <button class="btn-square" type="button" id="btn-settings-close" aria-label="Close" @click="close">
        <svg class="btn-glyph" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" stroke-width="1.6"
            stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <p class="settings-sub">Page</p>

    <label class="field">
      <span>Size</span>
      <select id="opt-page" :value="store.settings.pageSize" @change="update({ pageSize: $event.target.value })">
        <option value="A4">A4</option>
        <option value="Letter">US Letter</option>
        <option value="Legal">US Legal</option>
        <option value="A5">A5</option>
      </select>
    </label>

    <label class="field">
      <span>Margin</span>
      <span class="field-unit">
        <input id="opt-margin" type="number" min="5" max="40" step="1"
          :value="store.settings.marginMm" @change="update({ marginMm: $event.target.value })" />
        <span class="unit">mm</span>
      </span>
    </label>

    <p class="settings-sub">Text</p>

    <label class="field">
      <span>Body font</span>
      <select id="opt-font" :value="store.settings.font" @change="update({ font: $event.target.value })">
        <option value="serif">Serif</option>
        <option value="sans">Sans</option>
      </select>
    </label>

    <label class="field">
      <span>Size</span>
      <span class="field-unit">
        <input id="opt-size" type="number" min="8" max="16" step="0.5"
          :value="store.settings.fontSizePt" @change="update({ fontSizePt: $event.target.value })" />
        <span class="unit">pt</span>
      </span>
    </label>

    <p class="settings-sub">Preview</p>

    <label class="field field-check">
      <input id="opt-toc" type="checkbox" :checked="store.settings.showToc"
        @change="update({ showToc: $event.target.checked })" />
      <span>Table of contents</span>
    </label>

    <p class="settings-note">
      Save PDF opens the print dialog. Pick <strong>Save as PDF</strong> and turn off
      <strong>Headers and footers</strong>.
    </p>
  </div>
</template>
