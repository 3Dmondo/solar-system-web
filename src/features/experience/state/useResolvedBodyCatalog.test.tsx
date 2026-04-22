import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useResolvedBodyCatalog } from './useResolvedBodyCatalog'
import {
  resolveBodyCatalog,
  type BodyCatalogSource,
  type ResolvedBodyCatalog
} from '../../solar-system/data/bodyStateStore'

describe('useResolvedBodyCatalog', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('surfaces an explicit error when no async source is provided', () => {
    const { result } = renderHook(() =>
      useResolvedBodyCatalog('2000-01-01T12:00:00Z')
    )

    expect(result.current.status).toBe('error')
    expect(result.current.error?.message).toBe('Real ephemeris data source is not configured')
    expect(result.current.catalog.snapshot.capturedAt).toBe('2000-01-01T12:00:00.000Z')
    expect(result.current.catalog.metadata).toEqual([])
    expect(result.current.catalog.bodies).toEqual([])
  })

  it('loads an async catalog and exposes a loading state without seeding a fallback snapshot', async () => {
    const loadedCatalog = createCatalog('loaded-catalog', [100, 0, 0])
    let resolveLoad: ((catalog: ResolvedBodyCatalog) => void) | undefined
    const source: BodyCatalogSource = {
      loadBodyCatalogAtUtc: vi.fn(
        () =>
          new Promise<ResolvedBodyCatalog>((resolve) => {
            resolveLoad = resolve
          })
      ),
      prefetchAroundUtc: vi.fn(async () => undefined)
    }
    const { result } = renderHook(() =>
      useResolvedBodyCatalog('2000-01-01T12:00:00Z', source)
    )

    expect(result.current.status).toBe('loading')
    expect(result.current.catalog.snapshot.capturedAt).toBe('2000-01-01T12:00:00.000Z')
    expect(result.current.catalog.metadata).toEqual([])
    expect(result.current.catalog.bodies).toEqual([])
    expect(source.prefetchAroundUtc).toHaveBeenCalledWith('2000-01-01T12:00:00.000Z')

    resolveLoad?.(loadedCatalog)

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })

    expect(result.current.catalog).toBe(loadedCatalog)
    expect(result.current.error).toBeNull()
  })

  it('keeps the catalog empty and surfaces an error when the first async load fails', async () => {
    const source: BodyCatalogSource = {
      loadBodyCatalogAtUtc: vi.fn(async () => {
        throw new Error('Network exploded')
      }),
      prefetchAroundUtc: vi.fn(async () => undefined)
    }
    const { result } = renderHook(() =>
      useResolvedBodyCatalog('2000-01-01T12:00:00Z', source)
    )

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })

    expect(result.current.catalog.snapshot.capturedAt).toBe('2000-01-01T12:00:00.000Z')
    expect(result.current.catalog.metadata).toEqual([])
    expect(result.current.catalog.bodies).toEqual([])
    expect(result.current.error?.message).toBe('Network exploded')
  })

  it('keeps the last loaded catalog visible while a refreshed request is pending', async () => {
    vi.useFakeTimers()

    const firstCatalog = createCatalog('loaded-catalog-1', [100, 0, 0])
    const secondCatalog = createCatalog('loaded-catalog-2', [101, 0, 0])
    const pendingLoads: Array<(catalog: ResolvedBodyCatalog) => void> = []
    const source: BodyCatalogSource = {
      loadBodyCatalogAtUtc: vi.fn(
        () =>
          new Promise<ResolvedBodyCatalog>((resolve) => {
            pendingLoads.push(resolve)
          })
      ),
      prefetchAroundUtc: vi.fn(async () => undefined)
    }
    const { result, rerender } = renderHook(
      ({ requestedUtc }) => useResolvedBodyCatalog(requestedUtc, source),
      {
        initialProps: {
          requestedUtc: '2000-01-01T12:00:00Z'
        }
      }
    )

    expect(result.current.status).toBe('loading')
    expect(result.current.catalog.snapshot.capturedAt).toBe('2000-01-01T12:00:00.000Z')
    expect(result.current.catalog.metadata).toEqual([])
    expect(result.current.catalog.bodies).toEqual([])

    await act(async () => {
      pendingLoads[0]?.(firstCatalog)
      await Promise.resolve()
    })

    expect(result.current.status).toBe('ready')
    expect(result.current.catalog).toBe(firstCatalog)

    rerender({
      requestedUtc: '2000-01-01T12:00:01Z'
    })

    expect(result.current.status).toBe('ready')
    expect(result.current.catalog).toBe(firstCatalog)

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.status).toBe('loading')
    expect(result.current.catalog).toBe(firstCatalog)

    await act(async () => {
      pendingLoads[1]?.(secondCatalog)
      await Promise.resolve()
    })

    expect(result.current.status).toBe('ready')
    expect(result.current.catalog).toBe(secondCatalog)
  })

  it('keeps the last loaded real catalog visible when a refresh fails', async () => {
    const firstCatalog = createCatalog('loaded-catalog-1', [100, 0, 0])
    const source: BodyCatalogSource = {
      loadBodyCatalogAtUtc: vi
        .fn<BodyCatalogSource['loadBodyCatalogAtUtc']>()
        .mockResolvedValueOnce(firstCatalog)
        .mockRejectedValueOnce(new Error('Chunk boundary exploded')),
      prefetchAroundUtc: vi.fn(async () => undefined)
    }
    const { result, rerender } = renderHook(
      ({ requestedUtc }) => useResolvedBodyCatalog(requestedUtc, source),
      {
        initialProps: {
          requestedUtc: '2000-01-01T12:00:00Z'
        }
      }
    )

    await waitFor(() => {
      expect(result.current.status).toBe('ready')
    })

    rerender({
      requestedUtc: '2000-01-01T12:00:01Z'
    })

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })

    expect(result.current.catalog).toBe(firstCatalog)
    expect(result.current.error?.message).toBe('Chunk boundary exploded')
  })
})

function createCatalog(
  capturedAt: string,
  earthPosition: [number, number, number]
) {
  return resolveBodyCatalog(
    [
      {
        id: 'earth',
        displayName: 'Earth',
        color: '#3a7bd5',
        material: 'earth',
        radius: 1,
        focusOffset: [0, 0.25, 3.2]
      }
    ],
    {
      capturedAt,
      bodies: [
        {
          id: 'earth',
          position: earthPosition
        }
      ]
    }
  )
}
