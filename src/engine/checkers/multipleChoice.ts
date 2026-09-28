import type { Question, Submission } from '../../types/question'

/** Shared by level-k-reasoning and focal-point-prediction — both use a plain multiple-choice answer. */
export function checkMultipleChoice(question: Question, submitted: Submission): boolean {
  if (question.answer.kind !== 'multiple-choice' || submitted.kind !== 'multiple-choice') return false
  return submitted.value === question.answer.correctIndex
}
