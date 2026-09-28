import { describe, expect, it } from 'vitest'
import { progressReducer } from '../../persistence/progressReducer'
import { createEmptyProgress } from '../../types/progress'

describe('progressReducer', () => {
  it('records a correct attempt into perConcept, perGame, and attemptLog', () => {
    const state = createEmptyProgress()
    const next = progressReducer(state, {
      type: 'RECORD_ATTEMPT',
      timestamp: '2026-01-01T00:00:00.000Z',
      input: { questionId: 'q1', gameId: 'prisoners-dilemma', concept: 'dominant-strategy', correct: true },
    })

    expect(next.perConcept['dominant-strategy']).toEqual({
      attempts: 1,
      correct: 1,
      streak: 1,
      lastMisconceptions: [],
    })
    expect(next.perGame['prisoners-dilemma']).toEqual({
      questionsAttempted: ['q1'],
      questionsCorrectFirstTry: ['q1'],
      lastPlayedAt: '2026-01-01T00:00:00.000Z',
    })
    expect(next.attemptLog).toHaveLength(1)
  })

  it('resets streak and records the misconception on an incorrect attempt', () => {
    const state = createEmptyProgress()
    const afterCorrect = progressReducer(state, {
      type: 'RECORD_ATTEMPT',
      timestamp: '2026-01-01T00:00:00.000Z',
      input: { questionId: 'q1', gameId: 'prisoners-dilemma', concept: 'nash-equilibrium', correct: true },
    })
    const afterIncorrect = progressReducer(afterCorrect, {
      type: 'RECORD_ATTEMPT',
      timestamp: '2026-01-01T00:01:00.000Z',
      input: {
        questionId: 'q2',
        gameId: 'prisoners-dilemma',
        concept: 'nash-equilibrium',
        correct: false,
        misconceptionId: 'nash-vs-pareto',
      },
    })

    expect(afterIncorrect.perConcept['nash-equilibrium']).toEqual({
      attempts: 2,
      correct: 1,
      streak: 0,
      lastMisconceptions: ['nash-vs-pareto'],
    })
  })

  it('does not double-count a re-attempted question toward questionsCorrectFirstTry', () => {
    const state = createEmptyProgress()
    const afterWrong = progressReducer(state, {
      type: 'RECORD_ATTEMPT',
      timestamp: '2026-01-01T00:00:00.000Z',
      input: { questionId: 'q1', gameId: 'stag-hunt', concept: 'nash-equilibrium', correct: false },
    })
    const afterRetryCorrect = progressReducer(afterWrong, {
      type: 'RECORD_ATTEMPT',
      timestamp: '2026-01-01T00:01:00.000Z',
      input: { questionId: 'q1', gameId: 'stag-hunt', concept: 'nash-equilibrium', correct: true },
    })

    expect(afterRetryCorrect.perGame['stag-hunt'].questionsAttempted).toEqual(['q1'])
    expect(afterRetryCorrect.perGame['stag-hunt'].questionsCorrectFirstTry).toEqual([])
  })

  it('RESET restores an empty progress state', () => {
    const state = progressReducer(createEmptyProgress(), {
      type: 'RECORD_ATTEMPT',
      timestamp: '2026-01-01T00:00:00.000Z',
      input: { questionId: 'q1', gameId: 'prisoners-dilemma', concept: 'dominant-strategy', correct: true },
    })
    expect(progressReducer(state, { type: 'RESET' })).toEqual(createEmptyProgress())
  })
})
