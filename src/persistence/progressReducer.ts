import { ATTEMPT_LOG_LIMIT, createEmptyProgress } from '../types/progress'
import type { ConceptTag } from '../types/game'
import type { AttemptLogEntry, ConceptProgress, GameProgress, ProgressStateV1 } from '../types/progress'

export interface RecordAttemptInput {
  questionId: string
  gameId: string
  concept: ConceptTag
  correct: boolean
  misconceptionId?: string
}

export type ProgressAction =
  | { type: 'RECORD_ATTEMPT'; timestamp: string; input: RecordAttemptInput }
  | { type: 'RESET' }

export function progressReducer(state: ProgressStateV1, action: ProgressAction): ProgressStateV1 {
  switch (action.type) {
    case 'RESET':
      return createEmptyProgress()
    case 'RECORD_ATTEMPT': {
      const { questionId, gameId, concept, correct, misconceptionId } = action.input
      const { timestamp } = action

      const prevConcept = state.perConcept[concept]
      const nextConcept: ConceptProgress = {
        attempts: (prevConcept?.attempts ?? 0) + 1,
        correct: (prevConcept?.correct ?? 0) + (correct ? 1 : 0),
        streak: correct ? (prevConcept?.streak ?? 0) + 1 : 0,
        lastMisconceptions: misconceptionId
          ? [misconceptionId, ...(prevConcept?.lastMisconceptions ?? [])].slice(0, 5)
          : (prevConcept?.lastMisconceptions ?? []),
      }

      const prevGame = state.perGame[gameId]
      const alreadyAttempted = prevGame?.questionsAttempted.includes(questionId) ?? false
      const nextGame: GameProgress = {
        questionsAttempted: alreadyAttempted
          ? (prevGame?.questionsAttempted ?? [])
          : [...(prevGame?.questionsAttempted ?? []), questionId],
        questionsCorrectFirstTry:
          correct && !alreadyAttempted
            ? [...(prevGame?.questionsCorrectFirstTry ?? []), questionId]
            : (prevGame?.questionsCorrectFirstTry ?? []),
        lastPlayedAt: timestamp,
      }

      const logEntry: AttemptLogEntry = { timestamp, questionId, gameId, concept, correct, misconceptionId }
      const nextAttemptLog = [logEntry, ...state.attemptLog].slice(0, ATTEMPT_LOG_LIMIT)

      return {
        ...state,
        perConcept: { ...state.perConcept, [concept]: nextConcept },
        perGame: { ...state.perGame, [gameId]: nextGame },
        attemptLog: nextAttemptLog,
      }
    }
    default:
      return state
  }
}
