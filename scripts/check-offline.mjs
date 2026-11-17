import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(process.cwd())
const failures = []

const NETWORK_API = /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\s*\(/
// Library code in the bundle can name an API without a call, so the bare-token
// check applies to the app sources only.
const NETWORK_API_SRC = /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/
// localStorage holds one flag only: that the info screen was shown. The draft
// never reaches storage. Any other storage API, cookie access, or bracket
// access to localStorage is a failure.
const STORAGE_API =
  /\b(sessionStorage|indexedDB)\s*[.[]|document\.cookie|localStorage\s*(\.(?!(get|set|remove)Item)|\[)/

function check(name, ok, detail = '') {
  if (!ok) failures.push(detail ? `${name} (${detail})` : name)
}

function listSources(path) {
  const full = join(root, path)
  if (statSync(full).isFile()) return [full]

  return readdirSync(full).flatMap((entry) => {
    const child = join(full, entry)
    if (statSync(child).isDirectory()) return listSources(join(path, entry))
    return [child]
  })
}

const sources = listSources('src').concat(join(root, 'index.html'))
for (const file of sources) {
  const text = readFileSync(file, 'utf8')
  const name = file.replace(`${root}/`, '')
  check(`no network call in ${name}`, !NETWORK_API.test(text))
  check(`no network API in ${name}`, !NETWORK_API_SRC.test(text))
  check(`no storage call in ${name}`, !STORAGE_API.test(text))
}

// One inline script holds the whole bundle. The policy must list the hash of
// that exact source, so an injected inline script does not run.
function inlineScriptCodes(html) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(([, attrs]) => !/\bsrc=/.test(attrs))
    .map(([, , code]) => code)
}

function inlineScriptsAreHashed(html, policy) {
  const codes = inlineScriptCodes(html)
  return codes.every((code) => {
    const digest = createHash('sha256').update(code).digest('base64')
    return policy.includes(`'sha256-${digest}'`)
  })
}

const dist = readFileSync(join(root, 'dist/index.html'), 'utf8')

check('the content security policy blocks the network', /connect-src 'none'/.test(dist))
const policy = dist.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)"/)?.[1] ?? ''
check('the content security policy exists', policy !== '')
check(
  'the content security policy comes before the first script',
  dist.indexOf('Content-Security-Policy') < dist.search(/<script/i),
)
check("the script sources are hashed, not 'unsafe-inline'", inlineScriptsAreHashed(dist, policy))
check(
  'the content security policy comes before the first script',
  dist.indexOf('Content-Security-Policy') < dist.search(/<script/i),
)
check('no external script tag', !/<script[^>]+\bsrc=/i.test(dist))
check('no external stylesheet', !/<link[^>]+rel=["']?stylesheet/i.test(dist))
check('no network call in the bundle', !NETWORK_API.test(dist))
check('no storage call in the bundle', !STORAGE_API.test(dist))
const hasRemoteAsset = /\bsrc=["']https?:/i.test(dist) || /<link[^>]+\bhref=["']https?:/i.test(dist)
check('no remote asset attribute', !hasRemoteAsset)

const sizeKb = Math.round(Buffer.byteLength(dist) / 1024)

if (failures.length > 0) {
  for (const failure of failures) console.error(`✗ ${failure}`)
  process.exit(1)
}

console.log(`✓ ${sources.length} source files and dist/index.html (${sizeKb} kB) stay offline`)
