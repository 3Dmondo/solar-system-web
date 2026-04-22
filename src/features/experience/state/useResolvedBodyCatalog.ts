import { useEffect, useMemo, useRef, useState } from 'react'
import {
  createEmptyResolvedBodyCatalog,
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
  const emptyCatalog = useMemo(
    () => createEmptyResolvedBodyCatalog(normalizedRequestedUtc),
    [normalizedRequestedUtc]
  )
  const [catalog, setCatalog] = useState<ResolvedBodyCatalog>(emptyCatalog)
  const [status, setStatus] = useState<ResolvedBodyCatalogStatus>(
    source ? 'loading' : 'error'
  )
  const [error, setError] = useState<Error | null>(
    source ? null : createMissingSourceError()
  )
  const hasLoadedSourceCatalog = useRef(false)

  useEffect(() => {
    if (!source) {
      setCatalog(emptyCatalog)
      setStatus('error')
      setError(createMissingSourceError())
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
      setCatalog(emptyCatalog)
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

        setStatus('error')
        setError(toError(reason))

        if (!isRefreshingLoadedCatalog) {
          hasLoadedSourceCatalog.current = false
          setCatalog(emptyCatalog)
        }
      })

    return () => {
      isCancelled = true

      if (loadingTimeoutId !== undefined) {
        window.clearTimeout(loadingTimeoutId)
      }
    }
  }, [emptyCatalog, normalizedRequestedUtc, source])

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

function createMissingSourceError() {
  return new Error('Real ephemeris data source is not configured')
}
