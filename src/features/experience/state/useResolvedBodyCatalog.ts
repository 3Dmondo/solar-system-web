import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getResolvedBodyCatalog,
  type BodyCatalogSource,
  type ResolvedBodyCatalog
} from '../../solar-system/data/bodyStateStore'

export type ResolvedBodyCatalogStatus = 'ready' | 'loading' | 'error'

const refreshLoadingDelayMs = 150

export function useResolvedBodyCatalog(
  requestedUtc: Date | string,
  source?: BodyCatalogSource
) {
  const normalizedRequestedUtc = useMemo(
    () => normalizeRequestedUtc(requestedUtc),
    [requestedUtc]
  )
  const fallbackCatalog = useMemo(
    () => getResolvedBodyCatalog(normalizedRequestedUtc),
    [normalizedRequestedUtc]
  )
  const [catalog, setCatalog] = useState<ResolvedBodyCatalog>(fallbackCatalog)
  const [status, setStatus] = useState<ResolvedBodyCatalogStatus>(
    source ? 'loading' : 'ready'
  )
  const [error, setError] = useState<Error | null>(null)
  const hasLoadedSourceCatalog = useRef(false)

  useEffect(() => {
    if (!source) {
      setCatalog(fallbackCatalog)
      setStatus('ready')
      setError(null)
      hasLoadedSourceCatalog.current = false
      return
    }

    let isCancelled = false
    let loadingTimeoutId: number | undefined
    const isRefreshingLoadedCatalog = hasLoadedSourceCatalog.current

    setError(null)

    if (isRefreshingLoadedCatalog) {
      setStatus('ready')
      loadingTimeoutId = window.setTimeout(() => {
        if (!isCancelled) {
          setStatus('loading')
        }
      }, refreshLoadingDelayMs)
    } else {
      setCatalog(fallbackCatalog)
      setStatus('loading')
    }

    source.prefetchAroundUtc(normalizedRequestedUtc).catch(() => undefined)

    source
      .loadBodyCatalogAtUtc(normalizedRequestedUtc)
      .then((loadedCatalog) => {
        if (isCancelled) {
          return
        }

        if (loadingTimeoutId !== undefined) {
          window.clearTimeout(loadingTimeoutId)
        }

        hasLoadedSourceCatalog.current = true
        setCatalog(loadedCatalog)
        setStatus('ready')
      })
      .catch((reason: unknown) => {
        if (isCancelled) {
          return
        }

        if (loadingTimeoutId !== undefined) {
          window.clearTimeout(loadingTimeoutId)
        }

        hasLoadedSourceCatalog.current = false
        setCatalog(fallbackCatalog)
        setStatus('error')
        setError(toError(reason))
      })

    return () => {
      isCancelled = true

      if (loadingTimeoutId !== undefined) {
        window.clearTimeout(loadingTimeoutId)
      }
    }
  }, [fallbackCatalog, normalizedRequestedUtc, source])

  return {
    catalog,
    status,
    error
  }
}

function normalizeRequestedUtc(requestedUtc: Date | string) {
  const utcDate = typeof requestedUtc === 'string' ? new Date(requestedUtc) : requestedUtc

  if (Number.isNaN(utcDate.getTime())) {
    throw new Error('requestedUtc must be a valid Date or ISO-8601 string')
  }

  return utcDate.toISOString()
}

function toError(reason: unknown) {
  if (reason instanceof Error) {
    return reason
  }

  return new Error('Failed to load body catalog')
}
