import type { Question, Submission } from '../../types/question'

export function checkDominantStrategy(question: Question, submitted: Submission): boolean {
  if (question.answer.kind !== 'strategy-or-none' || submitted.kind !== 'strategy-or-none') return false
  return submitted.value === question.answer.correct
}
