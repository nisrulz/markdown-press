import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Blocks every network path at the platform level. connect-src 'none' stops fetch, XHR,
// WebSocket and EventSource, so an upload cannot leave the tab even if code tries.
const CSP = [
  "default-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: file:",
  "font-src 'self' data:",
  "manifest-src 'self'",
  "worker-src 'self'",
  "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ')

function contentSecurityPolicy() {
  return {
    name: 'inject-csp',
    apply: 'build',
    transformIndexHtml(html) {
      const meta = `<meta http-equiv="Content-Security-Policy" content="${CSP}" />`
      return html.replace('<head>', `<head>\n    ${meta}`)
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [vue(), contentSecurityPolicy(), viteSingleFile()],
  build: {
    target: 'es2022',
    modulePreload: { polyfill: false },
  },
  test: {
    environment: 'happy-dom',
    exclude: ['**/node_modules/**', '**/dist/**', '**/.trash/**'],
  },
})
