import { defineConfig } from '@playwright/test'

// The tests drive the real single-file build. The web server builds dist/,
// serves it on a fixed port, and reuses a server that is already up.
export default defineConfig({
  testDir: './test/e2e',
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173/',
    // The outer agent sandbox forbids a nested sandbox init
    // (forbidden-sandbox-reinit), and Playwright tests do not need it.
    chromiumSandbox: false,
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: true,
    stdout: 'ignore',
  },
})
