import '../styles/app.css'
import '../styles/document.css'
import { createApp } from 'vue'
import App from '../App.vue'

// GitHub Pages cannot send a frame header, and a meta CSP cannot carry
// frame-ancestors. Moving a framed page to the top window stops an overlay
// attack on the print and replace actions.
try {
  if (window.top !== window.self) window.top.location = window.self.location
} catch {
  // A sandboxed frame denies the navigation. The app still runs in the frame.
}

createApp(App).mount('#app')

// The service worker is an install asset, not a runtime network path. It caches
// same-origin files only, and the page keeps connect-src 'none'.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
}
