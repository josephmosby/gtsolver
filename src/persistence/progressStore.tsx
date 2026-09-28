import { createContext, useCallback, useContext, useEffect, useReducer } from 'react'
import { progressReducer } from './progressReducer'
import { loadProgress, saveProgress } from './storage'
import type { ReactNode } from 'react'
import type { RecordAttemptInput } from './progressReducer'
import type { ProgressStateV1 } from '../types/progress'

interface ProgressContextValue {
  state: ProgressStateV1
  recordAttempt: (input: RecordAttemptInput) => void
  reset: () => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(progressReducer, undefined, loadProgress)

  useEffect(() => {
    saveProgress(state)
  }, [state])

  const recordAttempt = useCallback((input: RecordAttemptInput) => {
    dispatch({ type: 'RECORD_ATTEMPT', timestamp: new Date().toISOString(), input })
  }, [])

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  return <ProgressContext.Provider value={{ state, recordAttempt, reset }}>{children}</ProgressContext.Provider>
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within a ProgressProvider')
  return ctx
}
