import { beforeEach, describe, expect, it } from 'vitest'
import { hasSeenInfo, markInfoSeen } from '../src/scripts/info-flag.js'

describe('info flag', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('reports unseen on a fresh tab', () => {
    expect(hasSeenInfo()).toBe(false)
  })

  it('records the flag and reports seen', () => {
    markInfoSeen()

    expect(localStorage.getItem('markdown-press.info-seen')).toBe('1')
    expect(hasSeenInfo()).toBe(true)
  })

  it('treats unavailable storage as seen', () => {
    const original = window.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => {
          throw new Error('blocked')
        },
        setItem: () => {
          throw new Error('blocked')
        },
      },
      configurable: true,
    })

    try {
      expect(hasSeenInfo()).toBe(true)
      expect(() => markInfoSeen()).not.toThrow()
    } finally {
      Object.defineProperty(window, 'localStorage', {
        value: original,
        configurable: true,
      })
    }
  })
})
