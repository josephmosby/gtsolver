import type { Question, Submission } from '../../types/question'

export function checkBestResponse(question: Question, submitted: Submission): boolean {
  if (question.answer.kind !== 'strategy' || submitted.kind !== 'strategy') return false
  return submitted.value === question.answer.correct
}
