import type { ProgressStateV1 } from '../types/progress'
import type { Question } from '../types/question'

const RECENT_MISCONCEPTION_WEIGHT = 3
const UNATTEMPTED_WEIGHT = 2
const MIN_WEIGHT = 1

/** Higher weight = more likely to be resurfaced: low accuracy or recent misconceptions bias selection. */
export function weightForQuestion(question: Question, progress: ProgressStateV1): number {
  const concept = progress.perConcept[question.concept]
  if (!concept || concept.attempts === 0) return UNATTEMPTED_WEIGHT
  const accuracy = concept.correct / concept.attempts
  const inaccuracyWeight = Math.max(MIN_WEIGHT, (1 - accuracy) * 5)
  const misconceptionBoost = concept.lastMisconceptions.length > 0 ? RECENT_MISCONCEPTION_WEIGHT : 0
  return inaccuracyWeight + misconceptionBoost
}

/** Weighted random sample without replacement, biased toward weak/recently-missed concepts. */
export function pickWeightedReviewQuestions(allQuestions: Question[], progress: ProgressStateV1, count: number): Question[] {
  const pool = [...allQuestions]
  const picked: Question[] = []

  while (picked.length < count && pool.length > 0) {
    const weights = pool.map((q) => weightForQuestion(q, progress))
    const total = weights.reduce((sum, w) => sum + w, 0)
    let remaining = Math.random() * total
    let chosenIndex = pool.length - 1
    for (let i = 0; i < weights.length; i++) {
      remaining -= weights[i]
      if (remaining <= 0) {
        chosenIndex = i
        break
      }
    }
    picked.push(pool[chosenIndex])
    pool.splice(chosenIndex, 1)
  }

  return picked
}
