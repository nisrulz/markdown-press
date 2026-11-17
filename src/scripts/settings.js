export const PAGE_SIZES = {
  A4: { label: 'A4', width: 210, height: 297 },
  Letter: { label: 'US Letter', width: 215.9, height: 279.4 },
  Legal: { label: 'US Legal', width: 215.9, height: 355.6 },
  A5: { label: 'A5', width: 148, height: 210 },
}

export const FONT_STACKS = {
  serif:
    'Charter, "Iowan Old Style", "Source Serif Pro", Georgia, Cambria, "Times New Roman", serif',
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

export const LINE_HEIGHT = 1.55

export const DEFAULT_SETTINGS = {
  pageSize: 'A4',
  marginMm: 20,
  font: 'serif',
  fontSizePt: 11,
  showToc: false,
}

const LIMITS = {
  marginMin: 5,
  marginMax: 40,
  sizeMin: 8,
  sizeMax: 16,
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function normalizeSettings(raw = {}) {
  const merged = { ...DEFAULT_SETTINGS, ...raw }
  const pageSize = Object.hasOwn(PAGE_SIZES, merged.pageSize) ? merged.pageSize : 'A4'
  const font = Object.hasOwn(FONT_STACKS, merged.font) ? merged.font : 'serif'

  return {
    pageSize,
    font,
    marginMm: clamp(
      toNumber(merged.marginMm, DEFAULT_SETTINGS.marginMm),
      LIMITS.marginMin,
      LIMITS.marginMax,
    ),
    fontSizePt: clamp(
      toNumber(merged.fontSizePt, DEFAULT_SETTINGS.fontSizePt),
      LIMITS.sizeMin,
      LIMITS.sizeMax,
    ),
    showToc: Boolean(merged.showToc),
  }
}

function toNumber(value, fallback) {
  if (value === '' || value === null || value === undefined) return fallback
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.round(number * 2) / 2
}
