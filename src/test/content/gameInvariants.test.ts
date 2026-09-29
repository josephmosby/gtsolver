import { describe, expect, it } from 'vitest'
import { gameGenerators } from '../../data/games/index'
import { mulberry32 } from '../../engine/random'
import type { Question } from '../../types/question'

const TRIALS = 50

function answerOf(questions: Question[], id: string) {
  return questions.find((q) => q.id === id)?.answer
}

/**
 * Locks in the *intended* qualitative fact each game is meant to teach, independent of
 * the randomized numbers. This is what would actually catch a bug in a generator's
 * constraint formula — the cross-checks in answersMatchComputation.test.ts only confirm
 * internal consistency with the same gameUtils functions the generator itself calls.
 */
describe('game invariants hold across many random seeds', () => {
  it('prisoners-dilemma: Betray always dominates, (Betray,Betray) is always the unique Nash & the only non-Pareto-optimal cell', () => {
    const generate = gameGenerators['prisoners-dilemma']
    for (let seed = 0; seed < TRIALS; seed++) {
      const { questions } = generate(mulberry32(seed))
      expect(answerOf(questions, 'pd-dominant-strategy-row')).toEqual({ kind: 'strategy-or-none', correct: 'Betray' })
      expect(answerOf(questions, 'pd-nash-equilibrium')).toEqual({
        kind: 'cell-set',
        correct: [{ row: 'Betray', col: 'Betray' }],
      })
      const pareto = answerOf(questions, 'pd-pareto-optimal')
      expect(pareto?.kind).toBe('cell-set')
      expect(pareto?.kind === 'cell-set' && pareto.correct).toHaveLength(3)
    }
  })

  it('stag-hunt: no dominant strategy, both (Stag,Stag) & (Hare,Hare) are Nash, only (Stag,Stag) is Pareto optimal', () => {
    const generate = gameGenerators['stag-hunt']
    for (let seed = 0; seed < TRIALS; seed++) {
      const { questions } = generate(mulberry32(seed))
      expect(answerOf(questions, 'stag-dominant-strategy-row')).toEqual({ kind: 'strategy-or-none', correct: null })
      expect(answerOf(questions, 'stag-nash-equilibrium')).toEqual({
        kind: 'cell-set',
        correct: [
          { row: 'Stag', col: 'Stag' },
          { row: 'Hare', col: 'Hare' },
        ],
      })
      expect(answerOf(questions, 'stag-pareto-optimal')).toEqual({
        kind: 'cell-set',
        correct: [{ row: 'Stag', col: 'Stag' }],
      })
    }
  })

  it('pure-coordination: no dominant strategy, both matched cells are Nash AND both Pareto optimal', () => {
    const generate = gameGenerators['pure-coordination']
    for (let seed = 0; seed < TRIALS; seed++) {
      const { questions } = generate(mulberry32(seed))
      expect(answerOf(questions, 'purecoord-dominant-strategy-row')).toEqual({ kind: 'strategy-or-none', correct: null })
      const nash = answerOf(questions, 'purecoord-nash-equilibrium')
      const pareto = answerOf(questions, 'purecoord-pareto-optimal')
      expect(nash?.kind === 'cell-set' && nash.correct).toHaveLength(2)
      expect(pareto?.kind === 'cell-set' && pareto.correct).toHaveLength(2)
    }
  })

  it('ranked-coordination: no dominant strategy, both matched cells are Nash but only New/New is Pareto optimal', () => {
    const generate = gameGenerators['ranked-coordination']
    for (let seed = 0; seed < TRIALS; seed++) {
      const { questions } = generate(mulberry32(seed))
      expect(answerOf(questions, 'rankedcoord-dominant-strategy-row')).toEqual({ kind: 'strategy-or-none', correct: null })
      expect(answerOf(questions, 'rankedcoord-pareto-optimal')).toEqual({
        kind: 'cell-set',
        correct: [{ row: 'New Standard', col: 'New Standard' }],
      })
    }
  })

  it('trust-game: Trustee always betrays, Investor always withholds trust ("trust unravels")', () => {
    const generate = gameGenerators['trust-game']
    for (let seed = 0; seed < TRIALS; seed++) {
      const { questions } = generate(mulberry32(seed))
      expect(answerOf(questions, 'trust-trustee-decision')).toEqual({ kind: 'action', correct: 'Betray' })
      expect(answerOf(questions, 'trust-investor-decision')).toEqual({ kind: 'action', correct: 'Not Trust' })
    }
  })

  it('market-entry: Incumbent always accommodates, Entrant always enters (threat not credible)', () => {
    const generate = gameGenerators['market-entry']
    for (let seed = 0; seed < TRIALS; seed++) {
      const { questions } = generate(mulberry32(seed))
      expect(answerOf(questions, 'marketentry-incumbent-decision')).toEqual({ kind: 'action', correct: 'Accommodate' })
      expect(answerOf(questions, 'marketentry-entrant-decision')).toEqual({ kind: 'action', correct: 'Enter' })
    }
  })

  it('bank-run: B mirrors A, A always waits (run-free outcome under observability)', () => {
    const generate = gameGenerators['bank-run']
    for (let seed = 0; seed < TRIALS; seed++) {
      const { questions } = generate(mulberry32(seed))
      expect(answerOf(questions, 'bankrun-b-after-withdraw')).toEqual({ kind: 'action', correct: 'Withdraw' })
      expect(answerOf(questions, 'bankrun-b-after-wait')).toEqual({ kind: 'action', correct: 'Wait' })
      expect(answerOf(questions, 'bankrun-a-decision')).toEqual({ kind: 'action', correct: 'Wait' })
    }
  })

  it('beauty-contest: Nash answer is always "0", and level1/level2 strictly decrease toward it', () => {
    const generate = gameGenerators['beauty-contest']
    for (let seed = 0; seed < TRIALS; seed++) {
      const { questions } = generate(mulberry32(seed))
      const nashAnswer = answerOf(questions, 'beautycontest-nash')
      expect(nashAnswer?.kind).toBe('multiple-choice')
      if (nashAnswer?.kind === 'multiple-choice') {
        expect(nashAnswer.options[nashAnswer.correctIndex]).toBe('0')
      }
      const level1 = answerOf(questions, 'beautycontest-level1')
      const level2 = answerOf(questions, 'beautycontest-level2')
      expect(level1?.kind === 'numeric' && level2?.kind === 'numeric').toBe(true)
      if (level1?.kind === 'numeric' && level2?.kind === 'numeric') {
        expect(level1.correct).toBeLessThan(50)
        expect(level2.correct).toBeLessThan(level1.correct)
        expect(level2.correct).toBeGreaterThan(0)
      }
    }
  })

  it('divide-the-cities: the focal split is always the correct (index 0) option', () => {
    const generate = gameGenerators['divide-the-cities']
    for (let seed = 0; seed < TRIALS; seed++) {
      const { questions } = generate(mulberry32(seed))
      const focalAnswer = answerOf(questions, 'dividecities-focal-split')
      expect(focalAnswer?.kind === 'multiple-choice' && focalAnswer.correctIndex).toBe(0)
    }
  })
})
