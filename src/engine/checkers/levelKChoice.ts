import type { Question, Submission } from '../../types/question'

export function checkLevelKChoice(question: Question, submitted: Submission): boolean {
  if (question.answer.kind !== 'numeric' || submitted.kind !== 'numeric') return false
  const tolerance = question.answer.tolerance ?? 0
  return Math.abs(submitted.value - question.answer.correct) <= tolerance
}
