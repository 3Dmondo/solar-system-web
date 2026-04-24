import { createContext, useContext } from 'react'

export type SimulationClockContextValue = {
  playbackRateMultiplier: number
  isPaused: boolean
  /** Simulation start time as a UTC epoch in milliseconds. Stable across the session. */
  simulationInitialUtcMs: number
}

const defaultValue: SimulationClockContextValue = {
  playbackRateMultiplier: 1,
  isPaused: false,
  simulationInitialUtcMs: Date.now()
}

export const SimulationClockContext =
  createContext<SimulationClockContextValue>(defaultValue)

export function useSimulationClockContext(): SimulationClockContextValue {
  return useContext(SimulationClockContext)
}
