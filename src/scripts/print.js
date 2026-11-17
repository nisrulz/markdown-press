import { FONT_STACKS, LINE_HEIGHT, PAGE_SIZES, normalizeSettings } from './settings.js'

const PX_PER_MM = 96 / 25.4
const PX_PER_PT = 96 / 72

const FLATTEN = `
html, body {
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  background: #fff !important;
}
.app,
.workspace,
.preview-pane,
.doc-scroll,
.sheet-wrap,
.sheet-scale {
  display: block !important;
  width: auto !important;
  height: auto !important;
  min-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  overflow: visible !important;
  background: none !important;
  box-shadow: none !important;
  transform: none !important;
}
`

const HIDE_APP = `
.appbar,
.editor-pane,
.splitter,
.pane-head,
.statusbar,
.settings,
.info-overlay,
.toast,
.drop-hint,
#file-input {
  display: none !important;
}
`

const PAGE_BREAKS = `
.sheet h1,
.sheet h2,
.sheet h3,
.sheet h4 {
  break-after: avoid;
  page-break-after: avoid;
}
.sheet pre,
.sheet blockquote,
.sheet figure,
.sheet tr,
.sheet img,
.sheet .toc {
  break-inside: avoid;
  page-break-inside: avoid;
}
.sheet thead {
  display: table-header-group;
}
.sheet p,
.sheet li {
  orphans: 3;
  widows: 3;
}
.sheet pre {
  overflow: visible;
  white-space: pre-wrap;
}
`

export function pageMetrics(rawSettings) {
  const settings = normalizeSettings(rawSettings)
  const page = PAGE_SIZES[settings.pageSize]

  return {
    settings,
    pageWidthPx: page.width * PX_PER_MM,
    pageHeightPx: page.height * PX_PER_MM,
    paddingPx: settings.marginMm * PX_PER_MM,
    contentHeightPx: Math.max((page.height - settings.marginMm * 2) * PX_PER_MM, 1),
    fontSizePx: settings.fontSizePt * PX_PER_PT,
  }
}

export function buildPrintCss(rawSettings) {
  const settings = normalizeSettings(rawSettings)
  const page = PAGE_SIZES[settings.pageSize]

  return [
    `@page { size: ${page.width}mm ${page.height}mm; margin: ${settings.marginMm}mm; }`,
    FLATTEN,
    HIDE_APP,
    `.sheet {
  width: auto !important;
  min-height: 0 !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: #fff !important;
  box-shadow: none !important;
  color: #17150f;
  font-family: ${FONT_STACKS[settings.font]};
  font-size: ${settings.fontSizePt}pt;
  line-height: ${LINE_HEIGHT};
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}`,
    PAGE_BREAKS,
  ].join('\n')
}

export function applyPrintCss(rawSettings, doc = document) {
  let style = doc.getElementById('print-style')
  if (!style) {
    style = doc.createElement('style')
    style.id = 'print-style'
    style.media = 'print'
    doc.head.append(style)
  }
  style.textContent = buildPrintCss(rawSettings)
}

export function printDocument({ settings, title }, win = window) {
  const doc = win.document
  applyPrintCss(settings, doc)

  const previousTitle = doc.title
  doc.title = title || previousTitle

  win.addEventListener('afterprint', () => {
    doc.title = previousTitle
  }, { once: true })

  win.print()
}