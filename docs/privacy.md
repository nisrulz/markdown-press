# Privacy

The app stores almost nothing about you. It stores one flag, which remembers that the info screen
was shown. The draft never reaches storage. When you click a Markdown or Ko-fi link, its destination
receives a normal page request. The app does not send the draft with that request.

## Model

- The draft lives in one textarea on one page. It has no other copy.
- A refresh, a tab close, or a navigation discards it.
- One script call writes one `localStorage` flag: `markdown-press.info-seen`. No other value is
  stored, and no draft content reaches storage.
- The service worker caches app files, not your data. The cache holds the page, the manifest, and
  the icons. It holds no draft.
- No script makes a network request to a third party.
- Markdown and Ko-fi links open their destinations only when clicked.
- There is no analytics, telemetry, error reporting, remote font, or remote image.
- The build bundles every library. The page loads no external resource on its own.

## Enforcement

A statement in a README enforces nothing. Two mechanisms enforce this model.

### Content security policy

The build adds this policy to `dist/index.html`:

```
default-src 'none';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: file:;
font-src 'self' data:;
manifest-src 'self';
worker-src 'self';
connect-src 'none';
base-uri 'none';
form-action 'none'
```

`connect-src 'none'` is the important line. The browser refuses `fetch`, `XMLHttpRequest`,
`WebSocket`, `EventSource`, and `navigator.sendBeacon` before the request starts.

`worker-src 'self'` allows the service worker. The worker serves same-origin files from its cache.
`manifest-src 'self'` allows the install manifest.

The policy does not block a link that you click. The Ko-fi link opens a new tab. A Markdown link
opens its destination as set by the document.

`form-action 'none'` blocks a form post. `default-src 'none'` blocks every resource type that the
policy does not name.

`img-src` allows `data:` for embedded pictures and `file:` for images next to a local copy of the
page. The browser blocks a remote image URL. A pasted document therefore cannot send data through an
image request.

The policy sits in a `<meta>` tag at the start of `<head>`, before the first script. A policy that
arrives after the script does not cover it. `npm run check:offline` checks this order.

### Static scan

`scripts/check-offline.mjs` reads every file under `src/`, plus `index.html`, plus the built bundle.
It fails on:

- `fetch(`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon(`
- `sessionStorage`, `indexedDB`, or `document.cookie`; `localStorage` outside the one approved
  `getItem`, `setItem`, `removeItem` call for the info flag
- an external `<script src>` or `<link rel="stylesheet">`
- a remote resource `src` or a remote `<link href>`
- a missing CSP, or a CSP that comes after the first script

The scan allows external anchors. A click opens the destination. It does not attach the draft.

Run it with `make offline`. Run `make verify` to run it after the tests and the build.

## Limits

- **Browser extensions** read pages. Use a clean profile if this matters.
- **The operating system** can write memory to disk. That is outside the page.
- **The back and forward cache** can keep a page in memory after you navigate away. The draft stays
  in memory, not on disk.
- **Downloads.** After you save the PDF, the file is yours and normal file rules apply.
- **The print dialog** is browser UI. The page gives it a DOM tree, not a file.
- **Links.** A clicked Markdown or Ko-fi link contacts its destination. It does not include the draft.
- **Screenshots and screen sharing** show the draft like any other window.
- **The hosted copy.** If you put `dist/index.html` on a server, the server sees a request for the
  HTML file. It cannot see the draft, because the page never sends the draft.

## Why there is no draft recovery

Recovery needs `localStorage`, IndexedDB, or a file handle. Each one writes your text to disk, on a
machine that may be shared. The requirement is zero retention. The app therefore keeps nothing and
warns before you close a tab that holds text.

If you want an optional draft later, add it as a visible feature with a clear state. Do not add it as
a silent default.

## Audit it yourself

1. Run `make build` and open `dist/index.html`.
2. Open the developer tools, then the Network panel.
3. Reload the page. You see the page itself and nothing else.
4. Type in the editor. No new request appears.
5. Run `make offline`.
6. Search the bundle for `fetch(`. Library code can contain the word. Confirm that no call site
   runs.
