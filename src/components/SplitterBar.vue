<script setup>
import { ref } from 'vue'
import { setSplit, store } from '../scripts/store.js'

const el = ref(null)

function onPointerDown(event) {
  if (window.matchMedia('(max-width: 920px)').matches) return
  event.preventDefault()
  el.value.classList.add('dragging')
  el.value.setPointerCapture(event.pointerId)
  setSplit((event.clientX / window.innerWidth) * 100)
}

function onPointerMove(event) {
  if (!el.value.classList.contains('dragging')) return
  setSplit((event.clientX / window.innerWidth) * 100)
}

function onLostPointerCapture() {
  el.value.classList.remove('dragging')
}

function onKeydown(event) {
  const step = event.key === 'ArrowRight' ? 2 : event.key === 'ArrowLeft' ? -2 : 0
  if (step === 0) return
  event.preventDefault()
  setSplit(store.split + step)
}
</script>

<template>
  <div
    class="splitter"
    id="splitter"
    ref="el"
    role="separator"
    aria-orientation="vertical"
    aria-label="Resize panes"
    tabindex="0"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @lostpointercapture="onLostPointerCapture"
    @keydown="onKeydown"
  ></div>
</template>
