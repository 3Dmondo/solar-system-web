export const milestone51BenchmarkStartAtUtc = '2026-04-24T00:00:00Z'

export function resolveDebugClockStartAt(search: string) {
  const searchParams = new URLSearchParams(search)
  const requestedStartAt = searchParams.get('startAt')

  if (!requestedStartAt) {
    return milestone51BenchmarkStartAtUtc
  }

  const parsedStartAt = new Date(requestedStartAt)

  if (Number.isNaN(parsedStartAt.getTime())) {
    return milestone51BenchmarkStartAtUtc
  }

  return parsedStartAt.toISOString()
}
