import * as bankRun from './bank-run'
import * as marketEntry from './market-entry'
import * as prisonersDilemma from './prisoners-dilemma'
import * as pureCoordination from './pure-coordination'
import * as rankedCoordination from './ranked-coordination'
import * as stagHunt from './stag-hunt'
import * as trustGame from './trust-game'
import type { GameDefinition } from '../../types/game'
import type { Question } from '../../types/question'

interface GameModule {
  game: GameDefinition
  questions: Question[]
}

const modules: GameModule[] = [
  prisonersDilemma,
  pureCoordination,
  rankedCoordination,
  stagHunt,
  trustGame,
  marketEntry,
  bankRun,
]

export const games: GameDefinition[] = modules.map((m) => m.game)

export const gamesById: Record<string, GameDefinition> = Object.fromEntries(games.map((g) => [g.id, g]))

export const questionsByGameId: Record<string, Question[]> = Object.fromEntries(
  modules.map((m) => [m.game.id, m.questions]),
)

export const allQuestions: Question[] = modules.flatMap((m) => m.questions)
