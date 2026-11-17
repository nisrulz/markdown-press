import { expect, test } from '@playwright/test'

// The info screen shows on a first visit. Escape closes it and records the
// one approved storage flag.
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Escape')
})

test('boots the app shell', async ({ page }) => {
  await expect(page).toHaveTitle(/Markdown Press/)
  await expect(page.locator('#editor')).toBeVisible()
  await expect(page.locator('#sheet')).toBeVisible()
  await expect(page.locator('#stat-words')).toContainText(/\d/)
})

test('renders the preview from the editor', async ({ page }) => {
  await page.fill('#editor', '## E2E check')
  // Filter by name: the sample render coexists until the debounce passes.
  await expect(page.getByRole('heading', { level: 2, name: 'E2E check' })).toHaveCount(1)
})

test('page size settings update the preview', async ({ page }) => {
  await page.click('#btn-settings')
  await page.selectOption('#opt-page', 'Letter')
  await expect(page.locator('#page-hint')).toContainText('US Letter')
})

test('ships a content security policy that blocks the network', async ({ page }) => {
  // A fresh page avoids the beforeunload console noise that a reload of the
  // editor page produces.
  const fresh = await page.context().newPage()
  const errors = []
  fresh.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  await fresh.goto('/')

  const meta = fresh.locator('meta[http-equiv="Content-Security-Policy"]')
  await expect(meta).toHaveAttribute('content', /connect-src 'none'/)
  await expect(meta).toHaveAttribute('content', /script-src 'self' 'sha256-/)
  // The app boots with hashed scripts only, so the hash matched the bundle.
  await expect(fresh.locator('#app > *')).not.toHaveCount(0)
  expect(errors).toEqual([])
  await fresh.close()
})

test('stores only the info-screen flag', async ({ page }) => {
  const local = await page.evaluate('Object.keys(localStorage)')
  expect(local).toEqual(['markdown-press.info-seen'])
  const session = await page.evaluate('Object.keys(sessionStorage)')
  expect(session).toEqual([])
})
