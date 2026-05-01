import { useEffect, useState } from 'react'
import { type BodyCatalogSource, type SupportedTimeRange } from '../../solar-system/data/bodyStateStore'

export type CatalogTimeRangeStatus = 'unavailable' | 'loading' | 'ready' | 'error'

export function useCatalogTimeRange(source?: BodyCatalogSource) {
  const [range, setRange] = useState<SupportedTimeRange | null>(null)
  const [status, setStatus] = useState<CatalogTimeRangeStatus>(
    source?.getSupportedTimeRange ? 'loading' : 'unavailable'
  )
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!source?.getSupportedTimeRange) {
      setRange(null)
      setStatus('unavailable')
      setError(null)
      return
    }

    let isCancelled = false

    setStatus('loading')
    setError(null)

    source
      .getSupportedTimeRange()
      .then((nextRange) => {
        if (isCancelled) {
          return
        }

        setRange(nextRange)
        setStatus('ready')
      })
      .catch((reason: unknown) => {
        if (isCancelled) {
          return
        }

        setRange(null)
        setStatus('error')
        setError(reason instanceof Error ? reason : new Error('Failed to load ephemeris time range'))
      })

    return () => {
      isCancelled = true
    }
  }, [source])

  return {
    error,
    range,
    status
  }
}
