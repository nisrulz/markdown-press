import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS, normalizeSettings, PAGE_SIZES, FONT_STACKS } from '../src/scripts/settings.js'
import { countWords } from '../src/scripts/editor.js'
import {
  buildPreviewHtml,
  computePreviewScale,
  documentTitle,
  estimatePageCount,
  fitPreviewToWidth,
  tableOfContentsHtml,
} from '../src/scripts/preview.js'
import { renderMarkdown } from '../src/scripts/markdown.js'

describe('normalizeSettings', () => {
  it('reads numbers from form strings', () => {
    const settings = normalizeSettings({ marginMm: '18', fontSizePt: '10.5' })

    expect(settings.marginMm).toBe(18)
    expect(settings.fontSizePt).toBe(10.5)
  })

  it('clamps every value into the allowed range', () => {
    const settings = normalizeSettings({ marginMm: 2, fontSizePt: 44 })

    expect(settings.marginMm).toBe(5)
    expect(settings.fontSizePt).toBe(16)
  })

  it('falls back to defaults for unknown options', () => {
    const settings = normalizeSettings({ pageSize: 'B5', font: 'comic', marginMm: '' })

    expect(settings.pageSize).toBe('A4')
    expect(settings.font).toBe('serif')
    expect(settings.marginMm).toBe(DEFAULT_SETTINGS.marginMm)
  })

  it('keeps the legal page sizes and the font stacks in sync', () => {
    expect(Object.keys(PAGE_SIZES)).toEqual(['A4', 'Letter', 'Legal', 'A5'])
    expect(Object.keys(FONT_STACKS)).toEqual(['serif', 'sans'])
  })
})

describe('countWords', () => {
  it('counts words across whitespace', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('   ')).toBe(0)
    expect(countWords('one two\nthree\tfour')).toBe(4)
  })
})

describe('tableOfContentsHtml', () => {
  it('links every h2 and h3 to its heading id', () => {
    const nav = tableOfContentsHtml(renderMarkdown('## One\n\n### Two\n\n## One'))
    const doc = new DOMParser().parseFromString(nav, 'text/html')

    const links = [...doc.querySelectorAll('nav.toc a')]
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['#one', '#two', '#one-2'])
    expect(doc.querySelector('nav.toc')).not.toBeNull()
  })

  it('adds nothing for a document without subheadings', () => {
    expect(tableOfContentsHtml(renderMarkdown('# Only a title'))).toBe('')
  })

  it('starts with the nav so it lands before the first heading', () => {
    expect(tableOfContentsHtml(renderMarkdown('# Title\n\n## Part'))).toMatch(/^<nav/)
  })
})

describe('documentTitle', () => {
  it('uses the first h1 and strips filename-hostile characters', () => {
    const article = document.createElement('article')
    article.innerHTML = renderMarkdown('# Report: 2026 / Q1')

    expect(documentTitle(article, 'file')).toBe('Report- 2026 - Q1')
  })

  it('falls back to the file name, then to a constant', () => {
    const article = document.createElement('article')
    article.innerHTML = renderMarkdown('## No title here')

    expect(documentTitle(article, 'notes')).toBe('notes')
    expect(documentTitle(article, '')).toBe('document')
  })
})

describe('buildPreviewHtml', () => {
  it('shows a hint instead of an empty page', () => {
    expect(buildPreviewHtml('   ', false)).toContain('Nothing to preview')
  })

  it('renders markdown and skips the hint for content', () => {
    const html = buildPreviewHtml('# Hello', false)

    expect(html).toContain('<h1 id="hello">Hello</h1>')
    expect(html).not.toContain('Nothing to preview')
  })

  it('prepends the table of contents when it is enabled', () => {
    expect(buildPreviewHtml('# Title\n\n## Part', true)).toMatch(/^<nav/)
  })
})

describe('estimatePageCount', () => {
  it('never reports fewer than one page', () => {
    const sheet = document.createElement('article')
    sheet.innerHTML = buildPreviewHtml('# Short', false)

    expect(estimatePageCount(sheet, 900)).toBe(1)
  })
})

describe('computePreviewScale', () => {
  it('keeps the page at full size when the pane has room', () => {
    expect(computePreviewScale(900, 794)).toBe(1)
    expect(computePreviewScale(2000, 794)).toBe(1)
  })

  it('shrinks the page to the pane width', () => {
    expect(computePreviewScale(397, 794)).toBe(0.5)
  })

  it('stops at a sane width on a tiny pane', () => {
    expect(computePreviewScale(0, 794)).toBeCloseTo(120 / 794, 6)
  })

  it('ignores a broken page width', () => {
    expect(computePreviewScale(500, 0)).toBe(1)
    expect(computePreviewScale(500, Number.NaN)).toBe(1)
  })
})

describe('fitPreviewToWidth', () => {
  function nodes(clientWidth, sheetHeight) {
    const scroll = document.createElement('div')
    scroll.style.paddingLeft = '22px'
    scroll.style.paddingRight = '22px'
    Object.defineProperty(scroll, 'clientWidth', { value: clientWidth })
    document.body.append(scroll)

    const sheet = document.createElement('div')
    Object.defineProperty(sheet, 'offsetHeight', { value: sheetHeight })

    return {
      scroll,
      wrap: document.createElement('div'),
      layer: document.createElement('div'),
      sheet,
    }
  }

  it('sizes the wrapper to the scaled page', () => {
    const parts = nodes(500, 1123)
    const padding = 44
    const scale = (500 - padding) / 794

    fitPreviewToWidth(parts, 794)

    expect(parts.layer.style.width).toBe('794px')
    expect(Number.parseFloat(parts.layer.style.transform.slice(6))).toBeCloseTo(scale, 6)
    expect(Number.parseFloat(parts.wrap.style.width)).toBeCloseTo(794 * scale, 6)
    expect(Number.parseFloat(parts.wrap.style.height)).toBeCloseTo(1123 * scale, 6)
  })

  it('keeps the full page width when the pane has room', () => {
    const parts = nodes(1200, 1123)

    fitPreviewToWidth(parts, 794)

    expect(parts.layer.style.transform).toBe('scale(1)')
    expect(parts.wrap.style.width).toBe('794px')
  })
})
