# AGENTS.md

Read this file before you change the code.

## What this is

Markdown Press is a static single-page app. It turns markdown into a PDF through the browser print
engine. It runs offline, keeps no draft, and makes no automatic network request to a third party.
It is installable as a PWA.

Stack: Vue 3, markdown-it, highlight.js, Vite. No backend.

## Hard invariants

Break one of these and the product claim is false. Do not break them without an explicit decision
from the owner.

1. **No third-party network request.** Do not add `fetch`, XHR, `WebSocket`, a CDN, a remote font,
   an analytics script, or a remote image. External links may open only after a user click. The
   owner explicitly requested the Ko-fi link. Same-origin app assets are allowed: the manifest, the
   service worker, and the icons. The service worker caches same-origin files only.
2. **The draft is never stored.** The one approved exception is the `markdown-press.info-seen`
   localStorage flag, which records that the info screen was shown. No draft content, setting, or
   other value reaches `localStorage`, `sessionStorage`, IndexedDB, or a cookie.
3. **The CSP `<meta>` tag stays before the first script** in `dist/index.html`. The build injects it.
   `npm run check:offline` checks the order.
4. **The print stylesheet resets the preview geometry.** `.sheet-wrap`, `.sheet-scale`, and `.page`
   need `width: auto`, `height: auto`, and `transform: none` with `!important`, or the PDF prints
   scaled or clipped.
5. **Raw HTML stays escaped.** Keep `html: false` in `src/scripts/markdown.js`. Escape any value
   that comes from the document, such as a code fence language.
6. **The DOM ids are a contract** between the component templates and `test/app.test.js`. Rename
   both sides in one change.
7. **`LICENSE` holds the Apache 2.0 text.** Do not edit it. Do not add a contradictory license to a
   package manifest.

## Commands

| Command | Action |
| ------- | ------ |
| `make` | List the tasks. |
| `make setup` | Install the dependencies. |
| `make dev` | Dev server with hot reload. |
| `make test` | Unit and boot tests. |
| `make build` | Single-file build into `dist/`. |
| `make offline` | Scan the sources and the bundle for a network or storage call. |
| `make verify` | Test, build, then scan. This is the gate. |
| `make e2e` | Build `dist/`, then run the browser tests. |
| `make clean` | Move `dist/` and `coverage/` to `.trash/`. Never delete with `rm`. |

## Map

| Path | Holds |
| ---- | ----- |
| `src/App.vue` | Root component: global events, print orchestration, file input. |
| `src/components/` | One component per UI piece. |
| `src/scripts/store.js` | The reactive app state and its actions. |
| `src/scripts/main.js` | Mounts the app, registers the service worker. |
| `src/scripts/markdown.js` | markdown-it instance, heading ids, highlighting. |
| `src/scripts/print.js` | `@page` CSS, page metrics, print call, title swap. |
| `src/scripts/preview.js` | Preview HTML, contents block, preview scale. |
| `src/scripts/editor.js` | Textarea helpers. |
| `src/scripts/settings.js` | Defaults, page sizes, clamping. |
| `src/scripts/info-flag.js` | The one localStorage flag for the info screen. |
| `src/styles/app.css` | App chrome and dark mode. |
| `src/styles/document.css` | The printed page. |
| `playwright.config.js` | The Playwright e2e runner. |
| `public/` | PWA assets: `manifest.webmanifest`, `sw.js`, `icons/`, and `social.jpg` for link previews. |
| `test/` | Vitest suites. `app.test.js` boots the whole app. `test/e2e/` runs the built app in Chromium. |
| `docs/` | Architecture, printing, privacy, development. |
| `.github/workflows/deploy.yml` | Test, build, deploy to GitHub Pages on `master` or `main`. |

## Before you report done

1. Run `make verify`. It must pass.
2. Add a test for a behavior change. A bug fix needs a test that fails first.
3. Run the manual print check in `docs/printing.md` when you touch the print CSS, typography, or page
   metrics. Unit tests cannot see a page break.
4. Check the diff for accidental `dist/` or `.trash/` content. Both are ignored.
5. Report what you ran and what you did not run.

## Code rules

- One purpose per file, below 400 lines. One purpose per function, below 30 lines. At most 3
  parameters.
- Prefer the platform API over a new dependency.
- No comment that restates the code. A comment explains why.
- No speculative flag or unused parameter.
- Delete dead code in the same change.
- Match the existing style: 2-space indent, no semicolons, single quotes, named exports.

## Writing rules

All writing in this repo uses ASD-STE100: docs, comments, UI copy, and commit messages. Keep
sentences short. Use active voice. Write steps in the imperative. Use one word for one meaning. Do
not use a contraction. Stay inside the ASD-STE100 approved word list; do not invent variants of it.

## Where to change what

- Markdown feature: `src/scripts/markdown.js` plus `test/markdown.test.js`.
- Format control: the field in `SettingsPanel.vue`, then `DEFAULT_SETTINGS`,
  `normalizeSettings()`, and `buildPrintCss()`. Steps are in `docs/development.md`.
- Page size: `PAGE_SIZES` in `src/scripts/settings.js` and one `<option>` in `SettingsPanel.vue`.
- Print behavior: `src/scripts/print.js` and `docs/printing.md`.
- UI: the component in `src/components/` and `src/styles/app.css`. The document palette lives in
  `document.css` and is fixed, because it becomes the PDF.
- PWA: `public/manifest.webmanifest`, `public/sw.js`, and the registration in `main.js`.
- Deploy: `.github/workflows/deploy.yml`. The Pages source must stay **GitHub Actions**.

## Known limits

- The preview scale is a CSS transform. It never reaches print. Check the reset after any change that
  touches `.sheet-wrap` or `.sheet-scale`.
- `happy-dom` reports zero sizes. A test cannot assert a measured layout. Use a browser for that.
- The preview shows one continuous page. The print engine owns the pagination. The manual print
  check is the reference for a real break.
- The service worker and the manifest only work over http(s). A build opened from `file://` runs
  without them.
- The app starts with the sample document. It is not user content and sets no dirty flag.
