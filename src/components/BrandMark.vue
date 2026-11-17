<script setup>
import logoUrl from '../../img/logo.webp?inline'

const emit = defineEmits(['info'])
</script>

<template>
  <button class="brand" type="button" id="brand-mark" aria-label="About Markdown Press" @click="emit('info')">
    <img class="brand-logo" id="brand-logo" :src="logoUrl" alt="" />
    <span class="brand-name">Markdown Press</span>
  </button>
</template>
