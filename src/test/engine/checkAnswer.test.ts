import { describe, expect, it } from 'vitest'
import { checkAnswer } from '../../engine/checkAnswer'
import type { GameDefinition } from '../../types/game'
import type { Question } from '../../types/question'

const prisonersDilemma: GameDefinition = {
  id: 'prisoners-dilemma',
  title: "Prisoner's Dilemma",
  shortDescription: 'Two suspects, each better off defecting no matter what the other does.',
  concepts: ['dominant-strategy', 'nash-equilibrium', 'nash-vs-pareto'],
  representation: {
    kind: 'normal-form',
    players: ['Row', 'Col'],
    strategies: { Row: ['Cooperate', 'Defect'], Col: ['Cooperate', 'Defect'] },
    payoffs: {
      'Cooperate|Cooperate': [3, 3],
      'Cooperate|Defect': [0, 5],
      'Defect|Cooperate': [5, 0],
      'Defect|Defect': [1, 1],
    },
  },
}

const bestResponseQuestion: Question = {
  id: 'pd-best-response-1',
  gameId: 'prisoners-dilemma',
  type: 'best-response',
  prompt: "If Column plays Cooperate, what is Row's best response?",
  concept: 'dominant-strategy',
  locator: { kind: 'col', col: 'Cooperate' },
  subjectPlayer: 'Row',
  answer: { kind: 'strategy', correct: 'Defect' },
  misconceptions: [],
  explanation: 'Defect gives Row 5 instead of 3, so it beats Cooperate regardless of what Column does.',
}

describe('checkAnswer: best-response', () => {
  it('accepts the correct best response', () => {
    const result = checkAnswer(bestResponseQuestion, prisonersDilemma, { kind: 'strategy', value: 'Defect' })
    expect(result.correct).toBe(true)
  })

  it('rejects an incorrect best response with the explanation as fallback feedback', () => {
    const result = checkAnswer(bestResponseQuestion, prisonersDilemma, { kind: 'strategy', value: 'Cooperate' })
    expect(result.correct).toBe(false)
    expect(result.misconceptionId).toBeUndefined()
    expect(result.feedback).toBe(bestResponseQuestion.explanation)
  })
})

const dominantStrategyQuestion: Question = {
  id: 'pd-dominant-strategy-row',
  gameId: 'prisoners-dilemma',
  type: 'dominant-strategy',
  prompt: "Does Row have a dominant strategy? If so, which one?",
  concept: 'dominant-strategy',
  locator: { kind: 'none' },
  subjectPlayer: 'Row',
  answer: { kind: 'strategy-or-none', correct: 'Defect' },
  misconceptions: [],
  explanation: 'Defect strictly beats Cooperate against both of Column\'s strategies, so it dominates.',
}

describe('checkAnswer: dominant-strategy', () => {
  it('accepts the correct dominant strategy', () => {
    const result = checkAnswer(dominantStrategyQuestion, prisonersDilemma, {
      kind: 'strategy-or-none',
      value: 'Defect',
    })
    expect(result.correct).toBe(true)
  })

  it('rejects the wrong strategy', () => {
    const result = checkAnswer(dominantStrategyQuestion, prisonersDilemma, {
      kind: 'strategy-or-none',
      value: 'Cooperate',
    })
    expect(result.correct).toBe(false)
  })
})

const nashEquilibriumQuestion: Question = {
  id: 'pd-nash-equilibrium',
  gameId: 'prisoners-dilemma',
  type: 'nash-equilibrium-cell',
  prompt: 'Select all pure-strategy Nash equilibria.',
  concept: 'nash-equilibrium',
  locator: { kind: 'none' },
  answer: { kind: 'cell-set', correct: [{ row: 'Defect', col: 'Defect' }] },
  misconceptions: [],
  explanation: '(Defect, Defect) is the only cell where neither player can gain by switching alone.',
}

describe('checkAnswer: nash-equilibrium-cell', () => {
  it('accepts the correct equilibrium cell', () => {
    const result = checkAnswer(nashEquilibriumQuestion, prisonersDilemma, {
      kind: 'cell-set',
      value: [{ row: 'Defect', col: 'Defect' }],
    })
    expect(result.correct).toBe(true)
  })

  it('flags the Nash-vs-Pareto misconception when the mutually-best cell is picked instead', () => {
    const result = checkAnswer(nashEquilibriumQuestion, prisonersDilemma, {
      kind: 'cell-set',
      value: [{ row: 'Cooperate', col: 'Cooperate' }],
    })
    expect(result.correct).toBe(false)
    expect(result.misconceptionId).toBe('nash-vs-pareto')
  })
})
