import { describe, expect, it } from 'vitest'
import { renderMarkdown, slugify } from '../src/scripts/markdown.js'

describe('renderMarkdown', () => {
  it('gives every heading a unique id', () => {
    const html = renderMarkdown('# Title\n\n## Details\n\n## Details\n\n### Details')

    expect(html).toContain('id="title"')
    expect(html).toContain('id="details"')
    expect(html).toContain('id="details-2"')
    expect(html).toContain('id="details-3"')
  })

  it('escapes raw html from the source', () => {
    const html = renderMarkdown('<script>alert(1)</script><img src=x onerror=alert(1)>')

    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;script&gt;')
  })

  it('escapes a hostile code fence language', () => {
    const html = renderMarkdown('```js"><img src=x onerror=alert(1)>\nconst a = 1\n```')

    expect(html).not.toContain('<img')
    expect(html).toContain('language-')
  })

  it('highlights a known code fence language', () => {
    const html = renderMarkdown('```js\nconst answer = 42\n```')

    expect(html).toContain('class="hljs"')
    expect(html).toContain('hljs-keyword')
  })

  it('escapes code from an unknown language', () => {
    const html = renderMarkdown('```notalanguage\n<a> & </a>\n```')

    expect(html).toContain('&lt;a&gt; &amp;')
    expect(html).not.toContain('<a>')
  })

  it('renders tables, task lists and footnotes', () => {
    const html = renderMarkdown(
      '| A | B |\n| - | - |\n| 1 | 2 |\n\n- [x] done\n\nText[^1]\n\n[^1]: Note',
    )

    expect(html).toContain('<table>')
    expect(html).toContain('type="checkbox"')
    expect(html).toContain('checked')
    expect(html).toContain('footnotes')
  })

  it('drops javascript urls', () => {
    const html = renderMarkdown('[click](javascript:alert(1))')

    expect(html).not.toContain('href="javascript')
  })

  it('keeps data images so offline pictures print', () => {
    const html = renderMarkdown('![x](data:image/png;base64,iVBORw0KGgo=)')

    expect(html).toContain('src="data:image/png;base64,iVBORw0KGgo="')
  })
})

describe('slugify', () => {
  it('keeps unicode letters and removes punctuation', () => {
    expect(slugify('Café: "Crème" & Brûlée!')).toBe('café-crème-brûlée')
  })

  it('falls back to a stable id for an empty label', () => {
    expect(slugify('!!!')).toBe('section')
  })
})
