# Architecture

The app is one static page. Vue 3 provides the components, Vite bundles the code. The build inlines
the script and the CSS into `dist/index.html`. Same-origin PWA assets (`manifest.webmanifest`,
`sw.js`, icons) sit next to it.

## Components and modules

| File | Responsibility |
| ---- | -------------- |
| `index.html` | Mount point, favicon, manifest link, theme color. |
| `src/scripts/main.js` | Mounts `App.vue`, registers the service worker in production. |
| `src/App.vue` | Root: global events, print orchestration, file input, info screen state. |
| `src/components/AppBar.vue` | Toolbar buttons and theme toggle. |
| `src/components/BrandMark.vue` | Logo and name. A click opens the info screen. |
| `src/components/SettingsPanel.vue` | Format fields bound to the store. |
| `src/components/EditorPane.vue` | Textarea, Tab indent, bold/italic/link shortcuts. |
| `src/components/PreviewPane.vue` | Paged preview: measure, paginate, scale. |
| `src/components/StatusBar.vue` | Words, characters, pages, support link. |
| `src/components/SplitterBar.vue` | Pointer and keyboard resize. |
| `src/components/InfoScreen.vue` | The once-per-install info screen. |
| `src/scripts/store.js` | The reactive state: source, settings, theme, toast, split, page count. |
| `src/scripts/markdown.js` | One markdown-it instance, heading ids, code highlighting. |
| `src/scripts/preview.js` | Preview HTML, contents block, page count, preview scale. |
| `src/scripts/print.js` | `@page` stylesheet, page metrics in pixels, the print call, the title swap. |
| `src/scripts/editor.js` | Textarea helpers: wrap a selection, indent lines, count words. |
| `src/scripts/settings.js` | Defaults, allowed page sizes, font stacks, value clamping. |
| `src/scripts/info-flag.js` | The one localStorage flag: that the info screen was shown. |
| `src/styles/app.css` | App chrome: toolbar, panes, format panel, status bar, dark mode. |
| `src/styles/document.css` | The paper: page box, document typography, code theme. |
| `public/sw.js` | Cache-first service worker for same-origin files. |
| `public/manifest.webmanifest` | Install metadata and icons. |

`markdown.js`, `settings.js`, and most of `preview.js` do not measure layout. A DOM test can drive
them.

## Render pipeline

```
input event
  → wait 120 ms for the next keystroke
  → deferred source updates
      → markdown-it → preview HTML (contents block included when the setting is on)
      → estimatePageCount()   one count per page of content height
      → fitPreview()          scale the sheet to the pane
      → applyPrintCss()       regenerate the print stylesheet
```

A full re-render runs on each change. The 120 ms wait keeps typing smooth. `Save PDF` flushes the
pending render first, so the title comes from the rendered sheet.

## Pagination

The print engine owns the pagination. The preview shows one continuous page: one `.sheet` with the
A4 width, the page padding, and a minimum height of one page. The content grows the sheet; the
status bar estimates the printed page count from the content height.

The manual check in `docs/printing.md` is the reference for a real break.

## Settings

`normalizeSettings()` decides which values are valid. It clamps numbers, rejects unknown page sizes
and fonts, and returns a complete object. The UI passes raw input to it and writes the clamped values
back. No other code trusts a raw value.

The settings live in the store in memory. Nothing persists them. See [privacy.md](privacy.md).

## Page geometry

The preview builds the page in CSS pixels from millimetres at 96 dpi:

```
pageWidthPx     = widthMm × 96 / 25.4
contentHeightPx = (heightMm − 2 × marginMm) × 96 / 25.4
```

The page boxes keep the true page width. `fitPreview()` shrinks a layer around the stack when the
pane is narrow:

```
scale = min(1, (paneWidth − padding) / pageWidthPx)
```

A transform does not change layout measurements. The print stylesheet clears the width, the height,
and the transform, so the screen scale cannot reach the PDF.

## Print path

`printDocument()` runs 4 steps:

1. It regenerates the print stylesheet from the current settings.
2. It sets `document.title` to the document title. The browser uses this title as the PDF file name.
3. It calls `window.print()`.
4. It restores the tab title after `afterprint`.

The browser owns pagination. The stylesheet supplies the page size, the margin, the break rules, and
the typography. See [printing.md](printing.md).

## Offline and install

- The service worker precaches the app shell on install and answers same-origin requests
  stale-while-revalidate: the cache answers at once, a fresh copy updates the cache for the next
  launch. A new cache name swaps the version; the old cache is deleted on activate.
- The page itself keeps `connect-src 'none'`. The worker adds no network path beyond same-origin.
- `manifest.webmanifest` describes a standalone app with 192 px and 512 px icons. The browser shows
  the install option from these files.

## Extension points

- **Markdown feature**: add a plugin to the `md` instance in `src/scripts/markdown.js`. Keep
  `html: false`.
- **Format control**: add the field to `SettingsPanel.vue`, then extend `DEFAULT_SETTINGS`,
  `normalizeSettings()`, and `buildPrintCss()`.
- **Page size**: add an entry to `PAGE_SIZES`. The preview and the print CSS read from that table.
- **Theme**: the app chrome and screen preview follow the selected theme. The print stylesheet keeps
  the page white.

## Constraints

- No third-party network request. A build-time CSP blocks script connections and remote assets.
- Markdown and Ko-fi links open their destinations only when clicked. The app does not send the
  draft with those requests.
- The draft never reaches storage. The one flag records that the info screen was shown.
- No web font. The preview and the PDF use system fonts, so the screen and the page use the same
  metrics.
