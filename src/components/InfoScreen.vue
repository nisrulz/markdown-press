<script setup>
const emit = defineEmits(['close'])
</script>

<template>
  <div class="info-overlay" @click.self="emit('close')">
    <section class="info-panel" role="dialog" aria-modal="true" aria-label="About Markdown Press">
      <div class="settings-head">
        <h2 class="settings-title">About</h2>
        <button class="btn-square" type="button" aria-label="Close" @click="emit('close')">
          <svg class="btn-glyph" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" stroke-width="1.6"
              stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <h3 class="info-heading">Markdown Press</h3>
      <p class="info-lead">Markdown to PDF, in your browser.</p>

      <ul class="info-list">
        <li>Type or paste markdown on the left. The page updates as you write.</li>
        <li>Click <strong>Save PDF</strong>, then choose <strong>Save as PDF</strong>. The PDF keeps
          selectable text and working links.</li>
        <li>Settings holds the page size, margins, body font, text size, and a contents list for
          long documents.</li>
        <li>Tables, task lists, footnotes, and code blocks render as they should. Drop a .md file on
          the page to open it.</li>
        <li>The app runs offline. There is no upload and no account, and your draft stays in this
          tab.</li>
        <li>Install it from the browser menu, and it opens like a native app.</li>
      </ul>

      <button class="btn btn-primary info-start" type="button" @click="emit('close')">
        Start writing
      </button>

      <p class="info-meta">
        <a href="https://github.com/nisrulz/markdown-press" target="_blank" rel="noopener noreferrer">
          Source on GitHub
        </a>
        <span class="dot" aria-hidden="true">·</span>
        <a href="https://github.com/nisrulz/markdown-press/blob/main/LICENSE" target="_blank"
          rel="noopener noreferrer">Apache 2.0 license</a>
      </p>
    </section>
  </div>
</template>
