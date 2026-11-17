import { createHash } from 'node:crypto'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Blocks every network path at the platform level. connect-src 'none' stops fetch, XHR,
// WebSocket and EventSource, so an upload cannot leave the tab even if code tries.
// style-src keeps 'unsafe-inline', because print.js writes style elements at run time.
const CSP = [
  "default-src 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: file:",
  "font-src 'self' data:",
  "manifest-src 'self'",
  "worker-src 'self'",
  "connect-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
]

function scriptSource(html) {
  const hashes = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(([, attrs]) => !/\bsrc=/.test(attrs))
    .map(([, , code]) => `'sha256-${createHash('sha256').update(code).digest('base64')}'`)

  return `script-src 'self' ${[...new Set(hashes)].join(' ')}`
}

// The bundle is inlined, so its hash is known only after vite-plugin-singlefile runs.
// This hook runs after that one. A hash replaces 'unsafe-inline': the browser runs the
// bundle and refuses every other inline script.
function contentSecurityPolicy() {
  return {
    name: 'inject-csp',
    apply: 'build',
    enforce: 'post',
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const html = bundle['index.html']
        if (!html) return
        const directives = [CSP[0], scriptSource(html.source), ...CSP.slice(1)]
        const meta = `<meta http-equiv="Content-Security-Policy" content="${directives.join('; ')}" />`
        html.source = html.source.replace('<head>', `<head>\n    ${meta}`)
      },
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [vue(), viteSingleFile(), contentSecurityPolicy()],
  build: {
    target: 'es2022',
    modulePreload: { polyfill: false },
  },
  test: {
    environment: 'happy-dom',
    exclude: ['**/node_modules/**', '**/dist/**', '**/.trash/**', 'test/e2e/**'],
  },
})
