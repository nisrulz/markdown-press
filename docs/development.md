# Development

## Requirements

- Node 22.12 or newer. The test runner needs it.
- npm 10 or newer.

## Setup

```bash
make setup
make dev
```

Open the URL that Vite prints.

## Tasks

| Task | Action |
| ---- | ------ |
| `make` | List every task. |
| `make setup` | Install the dependencies. |
| `make dev` | Start the dev server with hot reload. |
| `make test` | Run the tests one time. |
| `make build` | Build `dist/index.html`. |
| `make preview` | Serve the built file on a local URL. |
| `make offline` | Scan the sources and the bundle for a network or storage call. |
| `make verify` | Test, build, then scan. |
| `make e2e` | Build `dist/`, then run the browser tests. |
| `make clean` | Move `dist/` and `coverage/` to `.trash/`. |

`make verify` is the gate. Run it before you commit.

## Tests

| File | Covers |
| ---- | ------ |
| `test/markdown.test.js` | Heading ids, raw HTML escaping, code fences, tables, task lists, footnotes, links. |
| `test/print.test.js` | `@page` output, margin clamping, page metrics, print style reuse, the title swap. |
| `test/editor.test.js` | Settings validation, word count, contents block, preview HTML, preview scale. |
| `test/paginate.test.js` | Table and list split points, the header repeat, the ordered list renumber. |
| `test/info-flag.test.js` | The one storage flag: unseen on a fresh tab, seen after the info screen. |
| `test/app.test.js` | Boots the real app in a DOM and checks the wiring. |
| `test/e2e/app.spec.js` | Boots the built app in Chromium. Checks the editor to preview flow, the settings, the CSP, and the one storage flag. |

Add a test with the code. A behavior change needs a test that fails before the change. The suites
run in `happy-dom`, so a test can build DOM nodes but cannot measure layout. The e2e suite runs the
real build in a browser through Playwright. `make e2e` builds `dist/` first, so run it after a
change, not instead of `make verify`.

## Manual print check

The tests cannot see a bad page break. Before you release:

1. Run `make dev`.
2. Click **Sample**.
3. Click **Save PDF** and save the file.
4. Check the page size, the margin, the table header on page 2, and the code block near the break.
5. Add a long table and a long code block, then export again.

## Deploy

The workflow `.github/workflows/deploy.yml` runs on every push to `master` or `main` and on a manual
dispatch.

1. The job checks out the repository and installs Node 22.
2. It runs `npm ci` and then `npm run verify`.
3. It uploads `dist/` as the Pages artifact.
4. A second job deploys the artifact.

Set **Settings → Pages → Source** to **GitHub Actions** one time. No branch build and no `gh-pages`
branch are necessary.

A failure in the tests or in the offline scan stops the deploy. The old site stays live.

## Add a markdown feature

Add the plugin to the single instance in `src/scripts/markdown.js`:

```js
import myPlugin from 'my-plugin'

md.use(myPlugin)
```

Keep `html: false`. Raw HTML from the editor must stay escaped. Add a case to
`test/markdown.test.js`.

## Add a format control

1. Add the field to `src/components/SettingsPanel.vue`. Copy the shape of an existing `.field`.
2. Add the key to `DEFAULT_SETTINGS` in `src/scripts/settings.js`.
3. Validate it in `normalizeSettings()`.
4. Use the value in `buildPrintCss()` in `src/scripts/print.js`. Use it in `pageMetrics()` too if the
   preview must follow.
5. Add a test to `test/print.test.js` or `test/editor.test.js`.
6. Check the print output by hand.

## Add a page size

Add an entry to `PAGE_SIZES` in `src/scripts/settings.js` and an `<option>` to
`src/components/SettingsPanel.vue`. The preview and the print CSS read from that table.

## Release checklist

1. `make verify` passes.
2. The manual print check passes.
3. The commit is on `master`.
4. The workflow goes green and the Pages URL serves the new build.
5. The draft is gone after a refresh. Confirm the zero-retention behavior one more time.
