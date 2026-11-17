import { renderMarkdown } from './markdown.js'

export const EMPTY_PREVIEW_HTML =
  '<p class="empty-state">Nothing to preview yet. Paste markdown, or drop a .md file on this page.</p>'

const TOC_SELECTOR = 'h2[id], h3[id]'

export function buildPreviewHtml(source, showToc) {
  if (String(source).trim() === '') return EMPTY_PREVIEW_HTML

  const articleHtml = renderMarkdown(source)
  return showToc ? tableOfContentsHtml(articleHtml) + articleHtml : articleHtml
}

function buildTocNav(doc, headings) {
  const nav = doc.createElement('nav')
  nav.className = 'toc'
  nav.setAttribute('aria-label', 'Contents')

  const title = doc.createElement('p')
  title.className = 'toc-title'
  title.textContent = 'Contents'

  const list = doc.createElement('ol')
  for (const heading of headings) {
    const item = doc.createElement('li')
    item.className = heading.tagName === 'H3' ? 'toc-h3' : 'toc-h2'

    const link = doc.createElement('a')
    link.href = `#${heading.id}`
    link.textContent = heading.textContent

    item.append(link)
    list.append(item)
  }

  nav.append(title, list)
  return nav
}

export function tableOfContentsHtml(articleHtml) {
  const doc = new DOMParser().parseFromString(`<body>${articleHtml}</body>`, 'text/html')
  const headings = [...doc.body.querySelectorAll(TOC_SELECTOR)]
  if (headings.length === 0) return ''

  return buildTocNav(doc, headings).outerHTML
}

const MIN_PREVIEW_WIDTH_PX = 120

function paddingOf(sheet) {
  return Number.parseFloat(getComputedStyle(sheet).paddingTop) || 0
}

export function estimatePageCount(sheet, contentHeightPx) {
  const padding = paddingOf(sheet)
  const contentHeight = Math.max(sheet.scrollHeight - padding * 2, 0)
  return Math.max(1, Math.ceil(contentHeight / contentHeightPx))
}

export function computePreviewScale(availableWidth, pageWidthPx) {
  if (!(pageWidthPx > 0)) return 1
  const usable = Math.max(availableWidth, MIN_PREVIEW_WIDTH_PX)
  return Math.min(1, usable / pageWidthPx)
}

export function fitPreviewToWidth({ scroll, wrap, layer, sheet }, pageWidthPx) {
  const style = getComputedStyle(scroll)
  const padding =
    (Number.parseFloat(style.paddingLeft) || 0) + (Number.parseFloat(style.paddingRight) || 0)
  const scale = computePreviewScale(scroll.clientWidth - padding, pageWidthPx)

  layer.style.width = `${pageWidthPx}px`
  layer.style.transform = `scale(${scale})`
  wrap.style.width = `${pageWidthPx * scale}px`
  wrap.style.height = `${sheet.offsetHeight * scale}px`
}

export function documentTitle(article, fallback) {
  const heading = article.querySelector('h1')?.textContent ?? ''
  const name = heading.trim() || fallback.trim() || 'document'

  return name
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 90)
}
