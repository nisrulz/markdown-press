import '../styles/app.css'
import '../styles/document.css'
import { createApp } from 'vue'
import App from '../App.vue'

createApp(App).mount('#app')

// The service worker is an install asset, not a runtime network path. It caches
// same-origin files only, and the page keeps connect-src 'none'.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
}
