export function isDebugExperiencePath(pathname: string) {
  const normalizedPathname = normalizePathname(pathname)

  return normalizedPathname === '/debug' || normalizedPathname.endsWith('/debug')
}

export function getIsCurrentPathDebugExperience() {
  if (typeof window === 'undefined') {
    return false
  }

  return isDebugExperiencePath(window.location.pathname)
}

function normalizePathname(pathname: string) {
  const pathnameWithLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`
  const trimmedPathname = pathnameWithLeadingSlash.replace(/\/+$/, '')

  return trimmedPathname.length > 0 ? trimmedPathname : '/'
}
