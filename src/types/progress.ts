import type { ConceptTag } from './game'

export interface ConceptProgress {
  attempts: number
  correct: number
  lastMisconceptions: string[]
  streak: number
}

export interface GameProgress {
  questionsAttempted: string[]
  questionsCorrectFirstTry: string[]
  lastPlayedAt: string
}

export interface AttemptLogEntry {
  timestamp: string
  questionId: string
  gameId: string
  concept: ConceptTag
  correct: boolean
  misconceptionId?: string
}

export const PROGRESS_STORAGE_KEY = 'gtsolver:progress:v1'
export const ATTEMPT_LOG_LIMIT = 200

export interface ProgressStateV1 {
  version: 1
  perConcept: Partial<Record<ConceptTag, ConceptProgress>>
  perGame: Record<string, GameProgress>
  attemptLog: AttemptLogEntry[]
}

export function createEmptyProgress(): ProgressStateV1 {
  return { version: 1, perConcept: {}, perGame: {}, attemptLog: [] }
}
