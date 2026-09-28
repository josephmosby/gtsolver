import type { Question, Submission } from '../../types/question'

export function checkNodeDecision(question: Question, submitted: Submission): boolean {
  if (question.answer.kind !== 'action' || submitted.kind !== 'action') return false
  return submitted.value === question.answer.correct
}
