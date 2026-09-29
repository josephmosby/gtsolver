import * as bankRun from './bank-run'
import * as beautyContest from './beauty-contest'
import * as divideTheCities from './divide-the-cities'
import * as marketEntry from './market-entry'
import * as prisonersDilemma from './prisoners-dilemma'
import * as pureCoordination from './pure-coordination'
import * as rankedCoordination from './ranked-coordination'
import * as stagHunt from './stag-hunt'
import * as trustGame from './trust-game'
import type { RNG } from '../../engine/random'
import type { GameDefinition } from '../../types/game'
import type { Question } from '../../types/question'

export interface GameModule {
  game: GameDefinition
  questions: Question[]
}

interface GameFile {
  generateInstance: (rng?: RNG) => GameModule
}

const gameFiles: GameFile[] = [
  prisonersDilemma,
  pureCoordination,
  rankedCoordination,
  stagHunt,
  trustGame,
  marketEntry,
  bankRun,
  beautyContest,
  divideTheCities,
]

// One unseeded instance per game, generated at module load — used only where payoff-agnostic
// data is needed (catalog cards, mistake-history prompt lookup). Never used for grading.
const catalogInstances = gameFiles.map((f) => ({ instance: f.generateInstance(), generateInstance: f.generateInstance }))

export const games: GameDefinition[] = catalogInstances.map((c) => c.instance.game)

export const gamesById: Record<string, GameDefinition> = Object.fromEntries(games.map((g) => [g.id, g]))

export const questionsByGameId: Record<string, Question[]> = Object.fromEntries(
  catalogInstances.map((c) => [c.instance.game.id, c.instance.questions]),
)

export const allQuestions: Question[] = catalogInstances.flatMap((c) => c.instance.questions)

/** Generates a fresh, freshly-randomized instance of a game. Use this (not the catalog above) for anything graded. */
export const gameGenerators: Record<string, (rng?: RNG) => GameModule> = Object.fromEntries(
  catalogInstances.map((c) => [c.instance.game.id, c.generateInstance]),
)
