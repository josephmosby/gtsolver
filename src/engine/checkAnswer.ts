import { checkBestResponse } from './checkers/bestResponse'
import { checkDominantStrategy } from './checkers/dominantStrategy'
import { checkLevelKChoice } from './checkers/levelKChoice'
import { checkMultipleChoice } from './checkers/multipleChoice'
import { checkNashEquilibriumCell } from './checkers/nashEquilibriumCell'
import { checkNodeDecision } from './checkers/nodeDecision'
import { checkParetoComparison } from './checkers/paretoComparison'
import { diagnostics } from './diagnostics'
import type { GameDefinition } from '../types/game'
import type { CheckResult, Question, Submission } from '../types/question'

function isCorrect(question: Question, submitted: Submission): boolean {
  switch (question.type) {
    case 'best-response':
      return checkBestResponse(question, submitted)
    case 'dominant-strategy':
      return checkDominantStrategy(question, submitted)
    case 'nash-equilibrium-cell':
      return checkNashEquilibriumCell(question, submitted)
    case 'pareto-comparison':
      return checkParetoComparison(question, submitted)
    case 'node-decision':
      return checkNodeDecision(question, submitted)
    case 'level-k-choice':
      return checkLevelKChoice(question, submitted)
    case 'level-k-reasoning':
    case 'focal-point-prediction':
      return checkMultipleChoice(question, submitted)
    default:
      throw new Error(`No checker implemented yet for question type "${question.type}"`)
  }
}

/**
 * Grading fallback order: exact match against the answer spec, then a generic
 * (game-shape-agnostic) misconception diagnostic, then question-specific authored
 * misconceptions, then a generic incorrect result with the question's explanation.
 */
export function checkAnswer(question: Question, game: GameDefinition, submitted: Submission): CheckResult {
  if (isCorrect(question, submitted)) {
    return { correct: true, feedback: question.explanation }
  }

  for (const diagnostic of diagnostics) {
    if (diagnostic.matches({ game, question, submitted })) {
      return { correct: false, misconceptionId: diagnostic.id, feedback: diagnostic.feedback }
    }
  }

  for (const misconception of question.misconceptions) {
    if (misconception.matches(submitted)) {
      return { correct: false, misconceptionId: misconception.id, feedback: misconception.feedback }
    }
  }

  return { correct: false, feedback: question.explanation }
}
