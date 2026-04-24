import { describe, expect, it } from 'vitest'
import { isDebugExperiencePath } from './debugRoute'
import {
  milestone51BenchmarkStartAtUtc,
  resolveDebugClockStartAt
} from './runtimeBenchmark'

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

  it('uses the milestone benchmark timestamp when no explicit debug start time is provided', () => {
    expect(resolveDebugClockStartAt('')).toBe(milestone51BenchmarkStartAtUtc)
  })

  it('accepts an explicit debug start time override when it is valid', () => {
    expect(resolveDebugClockStartAt('?startAt=2030-01-02T03:04:05Z')).toBe(
      '2030-01-02T03:04:05.000Z'
    )
  })

  it('falls back to the milestone benchmark timestamp when the debug start time is invalid', () => {
    expect(resolveDebugClockStartAt('?startAt=not-a-date')).toBe(
      milestone51BenchmarkStartAtUtc
    )
  })
})
