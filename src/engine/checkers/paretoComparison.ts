import { cellSetEqual } from '../matrixCell'
import type { Question, Submission } from '../../types/question'

export function checkParetoComparison(question: Question, submitted: Submission): boolean {
  if (question.answer.kind !== 'cell-set' || submitted.kind !== 'cell-set') return false
  return cellSetEqual(question.answer.correct, submitted.value)
}
