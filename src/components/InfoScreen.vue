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
        <li>Write or paste markdown, set the page format, then click Save PDF and choose
          <strong>Save as PDF</strong>.</li>
        <li>The app runs offline. There is no upload and no account.</li>
        <li>The draft never leaves this tab. The app stores one flag, to remember this screen.</li>
        <li>The PDF keeps selectable text and clickable links.</li>
        <li>Use your browser menu to install the app and run it like a native app.</li>
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
