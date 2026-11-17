import MarkdownIt from 'markdown-it'
import footnote from 'markdown-it-footnote'
import taskLists from 'markdown-it-task-lists'
import hljs from 'highlight.js/lib/common'

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function slugify(text) {
  const slug = String(text)
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-{2,}/g, '-')

  return slug || 'section'
}

export function uniqueId(base, seen) {
  const count = seen.get(base) ?? 0
  seen.set(base, count + 1)
  return count === 0 ? base : `${base}-${count + 1}`
}

function highlightCode(code, lang) {
  const language = String(lang ?? '')
    .trim()
    .split(/\s+/)[0]
    .toLowerCase()

  if (!language || !hljs.getLanguage(language)) return ''

  const html = hljs.highlight(code, { language, ignoreIllegals: true }).value
  return `<pre class="hljs"><code class="language-${escapeHtml(language)}">${html}</code></pre>`
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight: highlightCode,
})

md.use(footnote)
md.use(taskLists, { enabled: false, label: true })

md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
  const token = tokens[idx]
  const headingText = tokens[idx + 1]?.content ?? ''
  const seen = env.headingIds ?? new Map()
  env.headingIds = seen
  token.attrSet('id', uniqueId(slugify(headingText), seen))
  return self.renderToken(tokens, idx, options)
}

export function renderMarkdown(source) {
  return md.render(String(source ?? ''), {})
}
