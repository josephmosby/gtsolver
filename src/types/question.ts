import type { ConceptTag } from './game'

/** Points at the specific piece of a game a question is about. */
export type QuestionLocator =
  | { kind: 'cell'; row: string; col: string }
  /** Fixes the row player's strategy — used to ask about the column player's response to it. */
  | { kind: 'row'; row: string }
  /** Fixes the column player's strategy — used to ask about the row player's response to it. */
  | { kind: 'col'; col: string }
  | { kind: 'node'; nodeId: string }
  | { kind: 'information-set'; infoSetId: string }
  | { kind: 'none' }

export type QuestionType =
  | 'best-response'
  | 'dominant-strategy'
  | 'nash-equilibrium-cell'
  | 'pareto-comparison'
  | 'node-decision'
  | 'belief-best-response'
  | 'level-k-choice'
  | 'level-k-reasoning'
  | 'focal-point-prediction'

export interface MatrixCell {
  row: string
  col: string
}

/** The correct answer for a question, shaped per answer kind (several QuestionTypes can share a kind). */
export type AnswerSpec =
  | { kind: 'strategy'; correct: string }
  | { kind: 'strategy-or-none'; correct: string | null }
  | { kind: 'cell-set'; correct: MatrixCell[] }
  | { kind: 'action'; correct: string }
  | { kind: 'numeric'; correct: number; tolerance?: number }
  | { kind: 'multiple-choice'; options: string[]; correctIndex: number }

/** What the UI sends back on submit. Shape mirrors AnswerSpec. */
export type Submission =
  | { kind: 'strategy'; value: string }
  | { kind: 'strategy-or-none'; value: string | null }
  | { kind: 'cell-set'; value: MatrixCell[] }
  | { kind: 'action'; value: string }
  | { kind: 'numeric'; value: number }
  | { kind: 'multiple-choice'; value: number }

export interface MisconceptionEntry {
  id: string
  label: string
  /** True if this submission reflects this specific misconception. */
  matches: (submitted: Submission) => boolean
  feedback: string
}

export interface Question {
  id: string
  gameId: string
  type: QuestionType
  prompt: string
  concept: ConceptTag
  locator: QuestionLocator
  /** Which player this question is about. Required for best-response/dominant-strategy/
   * belief-best-response/level-k questions; implied by the node's mover for node-decision. */
  subjectPlayer?: string
  answer: AnswerSpec
  /** Scenario-specific wrong-answer feedback, checked after generic diagnostics. */
  misconceptions: MisconceptionEntry[]
  explanation: string
}

export interface CheckResult {
  correct: boolean
  misconceptionId?: string
  feedback: string
}
