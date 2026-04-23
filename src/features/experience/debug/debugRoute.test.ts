import { describe, expect, it } from 'vitest'
import { isDebugExperiencePath } from './debugRoute'

describe('debugRoute', () => {
  it('matches the local debug path with or without a trailing slash', () => {
    expect(isDebugExperiencePath('/debug')).toBe(true)
    expect(isDebugExperiencePath('/debug/')).toBe(true)
  })

  it('matches the GitHub Pages-style debug path under the project base', () => {
    expect(isDebugExperiencePath('/solar-system-web/debug')).toBe(true)
    expect(isDebugExperiencePath('/solar-system-web/debug/')).toBe(true)
  })

  it('does not treat the normal app path as debug mode', () => {
    expect(isDebugExperiencePath('/')).toBe(false)
    expect(isDebugExperiencePath('/solar-system-web/')).toBe(false)
    expect(isDebugExperiencePath('/solar-system-web')).toBe(false)
  })
})
