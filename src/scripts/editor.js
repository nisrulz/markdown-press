const INDENT = '  '

export function countWords(text) {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

function replaceBlock(textarea, start, end, text) {
  textarea.focus()
  textarea.setSelectionRange(start, end)

  const inserted = document.execCommand?.('insertText', false, text)
  if (inserted) {
    textarea.setSelectionRange(start, start + text.length)
    return
  }

  textarea.setRangeText(text, start, end, 'select')
}

export function surroundSelection(textarea, prefix, suffix = prefix, placeholder = 'text') {
  const { selectionStart: start, selectionEnd: end, value } = textarea
  const selected = value.slice(start, end) || placeholder
  replaceBlock(textarea, start, end, `${prefix}${selected}${suffix}`)
  textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length)
}

export function indentLines(textarea, direction = 1) {
  const { selectionStart, selectionEnd, value } = textarea
  const blockStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const nextBreak = value.indexOf('\n', selectionEnd)
  const blockEnd = nextBreak === -1 ? value.length : nextBreak
  const block = value.slice(blockStart, blockEnd)

  const changed = block
    .split('\n')
    .map((line) => (direction > 0 ? INDENT + line : line.replace(/^ {1,2}/, '')))
    .join('\n')

  replaceBlock(textarea, blockStart, blockEnd, changed)
  textarea.setSelectionRange(blockStart, blockStart + changed.length)
}
