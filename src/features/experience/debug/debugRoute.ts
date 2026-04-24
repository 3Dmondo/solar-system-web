import { resolveDebugClockStartAt } from './runtimeBenchmark'

export type DebugExperienceOptions = {
  clockStartAt?: string
  showDebugOverlay: boolean
}

export function isDebugExperiencePath(pathname: string) {
  const normalizedPathname = normalizePathname(pathname)

  return normalizedPathname === '/debug' || normalizedPathname.endsWith('/debug')
}

export function getIsCurrentPathDebugExperience() {
  return getCurrentDebugExperienceOptions().showDebugOverlay
}

export function getCurrentDebugExperienceOptions(): DebugExperienceOptions {
  if (typeof window === 'undefined') {
    return {
      showDebugOverlay: false
    }
  }

  if (!isDebugExperiencePath(window.location.pathname)) {
    return {
      showDebugOverlay: false
    }
  }

  return {
    clockStartAt: resolveDebugClockStartAt(window.location.search),
    showDebugOverlay: true
  }
}

function normalizePathname(pathname: string) {
  const pathnameWithLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`
  const trimmedPathname = pathnameWithLeadingSlash.replace(/\/+$/, '')

  return trimmedPathname.length > 0 ? trimmedPathname : '/'
}
