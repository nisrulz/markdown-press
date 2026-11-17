<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { FONT_STACKS, LINE_HEIGHT, PAGE_SIZES } from '../scripts/settings.js'
import { RENDER_DELAY_MS, store } from '../scripts/store.js'
import { pageMetrics } from '../scripts/print.js'
import { buildPreviewHtml, estimatePageCount, fitPreviewToWidth } from '../scripts/preview.js'

const scroll = ref(null)
const wrap = ref(null)
const layer = ref(null)
const sheet = ref(null)

const deferredSource = ref(store.source)
const metrics = computed(() => pageMetrics(store.settings))
const isEmpty = computed(() => deferredSource.value.trim() === '')
const html = computed(() => buildPreviewHtml(deferredSource.value, store.settings.showToc))

const pageHint = computed(() => {
  const { pageSize, marginMm, fontSizePt } = store.settings
  return `${PAGE_SIZES[pageSize].label} · ${marginMm} mm · ${fontSizePt} pt`
})

const sheetStyle = computed(() => ({
  '--page-w': `${metrics.value.pageWidthPx}px`,
  '--page-h': `${metrics.value.pageHeightPx}px`,
  '--page-pad': `${metrics.value.paddingPx}px`,
  '--doc-size': `${metrics.value.fontSizePx}px`,
  '--doc-line': String(LINE_HEIGHT),
  '--doc-font': FONT_STACKS[metrics.value.settings.font],
}))

let renderTimer = 0
let resizeFrame = 0

function fitPreview() {
  if (!scroll.value || !wrap.value || !layer.value || !sheet.value) return
  fitPreviewToWidth(
    { scroll: scroll.value, wrap: wrap.value, layer: layer.value, sheet: sheet.value },
    metrics.value.pageWidthPx,
  )
}

async function refresh() {
  await nextTick()
  if (!sheet.value) return
  store.pageCount = estimatePageCount(sheet.value, metrics.value.contentHeightPx)
  fitPreview()
}

function scheduleRender() {
  window.clearTimeout(renderTimer)
  renderTimer = window.setTimeout(() => {
    deferredSource.value = store.source
  }, RENDER_DELAY_MS)
}

function onResize() {
  window.cancelAnimationFrame(resizeFrame)
  resizeFrame = window.requestAnimationFrame(fitPreview)
}

async function flushPreview() {
  window.clearTimeout(renderTimer)
  deferredSource.value = store.source
  await refresh()
  return sheet.value
}

watch(() => store.source, scheduleRender)
watch([deferredSource, () => store.settings], refresh)
watch(() => store.split, fitPreview)

onMounted(() => {
  window.addEventListener('resize', onResize)
  refresh()
})

onBeforeUnmount(() => {
  window.clearTimeout(renderTimer)
  window.cancelAnimationFrame(resizeFrame)
  window.removeEventListener('resize', onResize)
})

defineExpose({ flushPreview })
</script>

<template>
  <section class="pane preview-pane" aria-label="PDF preview">
    <div class="pane-head">
      <span>Preview</span>
      <span class="pane-hint" id="page-hint">{{ pageHint }}</span>
    </div>
    <div class="doc-scroll" id="doc-scroll" ref="scroll">
      <div class="sheet-wrap" id="sheet-wrap" ref="wrap">
        <div class="sheet-scale" id="sheet-scale" ref="layer">
          <article
            class="sheet"
            id="sheet"
            ref="sheet"
            :class="{ 'is-empty': isEmpty }"
            :style="sheetStyle"
            v-html="html"
          ></article>
        </div>
      </div>
    </div>
  </section>
</template>
