import type { GameDefinition } from '../../types/game'
import type { Question, Submission } from '../../types/question'

export interface DiagnosticContext {
  game: GameDefinition
  question: Question
  submitted: Submission
}

/** A reusable, game-shape-generic detector for a specific wrong-answer pattern. */
export interface Diagnostic {
  id: string
  feedback: string
  matches: (ctx: DiagnosticContext) => boolean
}
