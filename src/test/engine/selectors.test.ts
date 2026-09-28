import { describe, expect, it } from 'vitest'
import { pickWeightedReviewQuestions, weightForQuestion } from '../../engine/selectors'
import { createEmptyProgress } from '../../types/progress'
import type { Question } from '../../types/question'

function makeQuestion(id: string, concept: Question['concept']): Question {
  return {
    id,
    gameId: 'prisoners-dilemma',
    type: 'best-response',
    prompt: id,
    concept,
    locator: { kind: 'none' },
    answer: { kind: 'strategy', correct: 'Defect' },
    misconceptions: [],
    explanation: 'because',
  }
}

describe('weightForQuestion', () => {
  it('gives unattempted concepts a modest fixed weight', () => {
    const progress = createEmptyProgress()
    expect(weightForQuestion(makeQuestion('q1', 'nash-equilibrium'), progress)).toBe(2)
  })

  it('weights a low-accuracy concept higher than a high-accuracy one', () => {
    const progress = {
      ...createEmptyProgress(),
      perConcept: {
        'nash-equilibrium': { attempts: 10, correct: 1, streak: 0, lastMisconceptions: [] },
        'dominant-strategy': { attempts: 10, correct: 9, streak: 9, lastMisconceptions: [] },
      },
    }
    const weak = weightForQuestion(makeQuestion('q1', 'nash-equilibrium'), progress)
    const strong = weightForQuestion(makeQuestion('q2', 'dominant-strategy'), progress)
    expect(weak).toBeGreaterThan(strong)
  })

  it('boosts weight when a concept has a recent misconception', () => {
    const progress = {
      ...createEmptyProgress(),
      perConcept: {
        'nash-equilibrium': { attempts: 5, correct: 5, streak: 5, lastMisconceptions: ['nash-vs-pareto'] },
      },
    }
    const withMisconception = weightForQuestion(makeQuestion('q1', 'nash-equilibrium'), progress)
    const perfectNoMisconception = weightForQuestion(makeQuestion('q2', 'dominant-strategy'), {
      ...createEmptyProgress(),
      perConcept: { 'dominant-strategy': { attempts: 5, correct: 5, streak: 5, lastMisconceptions: [] } },
    })
    expect(withMisconception).toBeGreaterThan(perfectNoMisconception)
  })
})

describe('pickWeightedReviewQuestions', () => {
  it('returns the requested count without duplicates when enough questions exist', () => {
    const questions = [
      makeQuestion('q1', 'nash-equilibrium'),
      makeQuestion('q2', 'dominant-strategy'),
      makeQuestion('q3', 'nash-vs-pareto'),
    ]
    const picked = pickWeightedReviewQuestions(questions, createEmptyProgress(), 2)
    expect(picked).toHaveLength(2)
    expect(new Set(picked.map((q) => q.id)).size).toBe(2)
  })

  it('caps out at the pool size when count exceeds available questions', () => {
    const questions = [makeQuestion('q1', 'nash-equilibrium')]
    const picked = pickWeightedReviewQuestions(questions, createEmptyProgress(), 5)
    expect(picked).toHaveLength(1)
  })
})
