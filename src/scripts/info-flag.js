const KEY = 'markdown-press.info-seen'

export function hasSeenInfo() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return true
  }
}

export function markInfoSeen() {
  try {
    localStorage.setItem(KEY, '1')
  } catch {
    // Storage is unavailable. The screen shows again on the next load.
  }
}
