import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { nextTick } from 'vue'
import { beforeAll, describe, expect, it } from 'vitest'

const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')
const head = indexHtml.match(/<head>([\s\S]*)<\/head>/)?.[1]

describe('app wiring', () => {
  beforeAll(async () => {
    document.head.innerHTML = head ?? ''
    document.body.innerHTML = '<div id="app"></div>'
    localStorage.clear()
    await import('../src/scripts/main.js')
  })

  it('uses the local logo for the brand and favicon', () => {
    expect(document.querySelector('.brand-logo').src).toMatch(/^data:image\/webp;base64,/)
    expect(document.querySelector('link[rel="icon"]').href).toMatch(/^data:image\/webp;base64,/)
  })

  it('renders the sample document in the preview', () => {
    expect(document.getElementById('editor').value).toContain('# Markdown Press')
    expect(document.querySelector('#sheet h1')?.textContent).toBe('Markdown Press')
    expect(document.getElementById('sheet').classList.contains('is-empty')).toBe(false)
  })

  it('paints the status bar', () => {
    expect(document.getElementById('stat-words').textContent).toMatch(/^\d+ words?$/)
    expect(document.getElementById('page-hint').textContent).toContain('A4')
    expect(document.getElementById('stat-pages').textContent).toMatch(/^\d+ pages?$/)
    expect(document.querySelector('.privacy-badge')).toBeNull()
  })

  it('shows the selected coffee support link in the status bar', () => {
    const support = document.querySelector('.support')
    const link = support.querySelector('a')

    expect(support.parentElement.className).toBe('status-right')
    expect(link.href).toBe('https://ko-fi.com/nisrulz')
    expect(link.textContent.trim()).toBe('Buy me a coffee')
    expect(support.textContent).toContain('commits are cheap; coffee isn’t.')
    expect(support.querySelector('em').textContent).toBe('coffee isn’t.')
    expect(link.target).toBe('_blank')
    expect(link.rel).toContain('noopener')
  })

  it('starts dark and toggles to light with the theme control', async () => {
    const button = document.getElementById('btn-theme')

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.querySelector('meta[name="theme-color"]').content).toBe('#1c1b1f')
    expect(button.textContent.trim()).toBe('')
    expect(button.getAttribute('aria-label')).toBe('Switch to light theme')
    button.click()
    await nextTick()
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.querySelector('meta[name="theme-color"]').content).toBe('#ffffff')
    expect(button.getAttribute('aria-label')).toBe('Switch to dark theme')
  })

  it('resets the markdown pane scroll after page restoration', () => {
    const editor = document.getElementById('editor')
    editor.scrollTop = 150

    window.dispatchEvent(new Event('pageshow'))

    expect(editor.scrollTop).toBe(0)
  })

  it('shows the info screen once and records the flag', async () => {
    const overlay = document.querySelector('.info-overlay')

    expect(overlay).not.toBeNull()
    expect(overlay.textContent).toContain('Markdown Press')
    expect(localStorage.getItem('markdown-press.info-seen')).toBe('1')

    overlay.querySelector('.info-start').click()
    await nextTick()

    expect(document.querySelector('.info-overlay')).toBeNull()
  })

  it('reopens the info screen from the brandmark', async () => {
    document.getElementById('brand-mark').click()
    await nextTick()
    expect(document.querySelector('.info-overlay')).not.toBeNull()

    document.querySelector('.info-overlay .btn-square').click()
    await nextTick()
    expect(document.querySelector('.info-overlay')).toBeNull()
  })

  it('installs the print stylesheet', () => {
    const style = document.getElementById('print-style')

    expect(style?.media).toBe('print')
    expect(style?.textContent).toContain('@page')
  })

  it('applies the page metrics to the sheet', () => {
    const sheet = document.getElementById('sheet')

    expect(sheet.style.getPropertyValue('--page-w')).not.toBe('')
    expect(sheet.style.getPropertyValue('--doc-font')).not.toBe('')
  })

  it('scales the page box to the preview pane', () => {
    const wrap = document.getElementById('sheet-wrap')
    const layer = document.getElementById('sheet-scale')

    expect(wrap.style.width).toMatch(/px$/)
    expect(layer.style.width).toMatch(/px$/)
    expect(layer.style.transform).toMatch(/^scale\(/)
  })

  it('keeps the format controls in sync with the settings', () => {
    expect(document.getElementById('opt-page').value).toBe('A4')
    expect(document.getElementById('opt-margin').value).toBe('20')
    expect(document.getElementById('opt-toc').checked).toBe(false)
  })
})
