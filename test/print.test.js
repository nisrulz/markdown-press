import { describe, expect, it } from 'vitest'
import {
  applyPrintCss,
  buildPrintCss,
  pageMetrics,
  printDocument,
} from '../src/scripts/print.js'

function fakeDocument() {
  const created = []
  return {
    title: 'Markdown Press',
    created,
    head: { append: (element) => created.push(element) },
    createElement: () => ({ id: '', media: '', textContent: '', style: {} }),
    getElementById: () => null,
  }
}

function fakeWindow(doc) {
  const handlers = new Map()
  return {
    document: doc,
    printCount: 0,
    print() {
      this.printCount += 1
    },
    addEventListener(type, handler) {
      handlers.set(type, handler)
    },
    fire(type) {
      handlers.get(type)?.()
    },
  }
}

describe('buildPrintCss', () => {
  it('writes an A4 page rule with the margin', () => {
    const css = buildPrintCss({ pageSize: 'A4', marginMm: 20, fontSizePt: 11 })

    expect(css).toContain('@page { size: 210mm 297mm; margin: 20mm; }')
    expect(css).toContain('font-size: 11pt')
  })

  it('writes a US Letter page rule', () => {
    const css = buildPrintCss({ pageSize: 'Letter', marginMm: 15 })

    expect(css).toContain('@page { size: 215.9mm 279.4mm; margin: 15mm; }')
  })

  it('keeps the printed page white and dark text', () => {
    const css = buildPrintCss({})

    expect(css).toContain('background: #fff !important;')
    expect(css).toContain('color: #17150f;')
  })

  it('clamps an out of range margin', () => {
    expect(buildPrintCss({ marginMm: 90 })).toContain('margin: 40mm;')
    expect(buildPrintCss({ marginMm: 1 })).toContain('margin: 5mm;')
  })

  it('hides the app chrome and flattens the page containers', () => {
    const css = buildPrintCss({})

    expect(css).toContain('.appbar')
    expect(css).toContain('.editor-pane')
    expect(css).toContain('display: none !important;')
    expect(css).toContain('.doc-scroll')
    expect(css).toContain('.sheet-scale')
    expect(css).toContain('transform: none !important;')
  })

  it('keeps headings with the text that follows', () => {
    expect(buildPrintCss({})).toContain('break-after: avoid')
  })
})

describe('pageMetrics', () => {
  it('converts A4 millimetres to 96 dpi pixels', () => {
    const metrics = pageMetrics({ pageSize: 'A4', marginMm: 20, fontSizePt: 11 })

    expect(metrics.pageWidthPx).toBeCloseTo((210 * 96) / 25.4, 6)
    expect(metrics.pageHeightPx).toBeCloseTo((297 * 96) / 25.4, 6)
    expect(metrics.contentHeightPx).toBeCloseTo((257 * 96) / 25.4, 6)
    expect(metrics.fontSizePx).toBeCloseTo((11 * 96) / 72, 6)
  })

  it('returns the normalized settings it measured', () => {
    const metrics = pageMetrics({ pageSize: 'Bogus', marginMm: '12' })

    expect(metrics.settings.pageSize).toBe('A4')
    expect(metrics.settings.marginMm).toBe(12)
  })
})

describe('applyPrintCss', () => {
  it('creates one print style element and reuses it', () => {
    const doc = fakeDocument()
    let element

    doc.getElementById = () => element ?? null
    doc.createElement = () => {
      element = { id: '', media: '', textContent: '', style: {} }
      return element
    }

    applyPrintCss({ pageSize: 'A5' }, doc)
    applyPrintCss({ pageSize: 'Legal' }, doc)

    expect(doc.created).toHaveLength(1)
    expect(element.media).toBe('print')
    expect(element.textContent).toContain('215.9mm 355.6mm')
  })
})

describe('printDocument', () => {
  it('prints with the document title and restores the app title', () => {
    const doc = fakeDocument()
    const win = fakeWindow(doc)

    printDocument({ settings: {}, title: 'Quarterly report' }, win)

    expect(win.printCount).toBe(1)
    expect(doc.title).toBe('Quarterly report')

    win.fire('afterprint')
    expect(doc.title).toBe('Markdown Press')
  })
})
