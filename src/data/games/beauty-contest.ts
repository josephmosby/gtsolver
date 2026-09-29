import { pick, shuffle } from '../../engine/random'
import type { RNG } from '../../engine/random'
import type { GameDefinition, ScenarioGame } from '../../types/game'
import type { Question } from '../../types/question'

const GAME_ID = 'beauty-contest'

const FRACTIONS: { value: number; label: string }[] = [
  { value: 1 / 2, label: 'one-half (1/2)' },
  { value: 3 / 5, label: 'three-fifths (3/5)' },
  { value: 2 / 3, label: 'two-thirds (2/3)' },
  { value: 3 / 4, label: 'three-quarters (3/4)' },
  { value: 4 / 5, label: 'four-fifths (4/5)' },
]

export function generateInstance(rng: RNG = Math.random): { game: GameDefinition; questions: Question[] } {
  const { value: fraction, label: fractionLabel } = pick(rng, FRACTIONS)
  const rangeMax = 100
  const level0 = rangeMax / 2
  const level1 = fraction * level0
  const level2 = fraction * level1

  const representation: ScenarioGame = {
    kind: 'scenario',
    players: ['You', 'The Crowd'],
    setupText: `A large group of players each secretly picks a number between 0 and ${rangeMax}. The winner is whoever's guess is closest to ${fractionLabel} of the average of everyone's guesses.`,
    parameters: { targetFraction: fraction, rangeMin: 0, rangeMax },
  }

  const game: GameDefinition = {
    id: GAME_ID,
    title: "Keynes' Beauty Contest",
    shortDescription:
      "Every player picks a number from a fixed range. The winner is whoever picks closest to a fraction of the average of all guesses. Success depends not on your own reasoning alone, but on correctly modeling how deep everyone else's reasoning goes.",
    concepts: ['level-k-reasoning', 'nash-equilibrium'],
    representation,
  }

  const level1Rounded = Math.round(level1 * 10) / 10
  const level2Rounded = Math.round(level2 * 10) / 10
  const nashOptions = shuffle(rng, ['0', String(Math.round(level2)), String(Math.round(level1)), String(level0)])
  const correctIndex = nashOptions.indexOf('0')

  const questions: Question[] = [
    {
      id: 'beautycontest-level1',
      gameId: GAME_ID,
      type: 'level-k-choice',
      prompt: `A "level-0" player guesses randomly, averaging around ${level0} (the middle of the range). What number would a "level-1" player guess — one who assumes everyone else is level-0 and best-responds to that?`,
      concept: 'level-k-reasoning',
      locator: { kind: 'none' },
      answer: { kind: 'numeric', correct: level1Rounded, tolerance: 1.5 },
      misconceptions: [],
      explanation: `${fractionLabel[0].toUpperCase()}${fractionLabel.slice(1)} of the level-0 average of ${level0} is about ${level1Rounded}. A level-1 player reasons one step further than the naive crowd and shades their guess down accordingly.`,
    },
    {
      id: 'beautycontest-level2',
      gameId: GAME_ID,
      type: 'level-k-choice',
      prompt: `What would a "level-2" player guess — one who assumes everyone else is level-1 (guessing about ${level1Rounded}) and best-responds to that?`,
      concept: 'level-k-reasoning',
      locator: { kind: 'none' },
      answer: { kind: 'numeric', correct: level2Rounded, tolerance: 2 },
      misconceptions: [],
      explanation: `${fractionLabel[0].toUpperCase()}${fractionLabel.slice(1)} of ${level1Rounded} is about ${level2Rounded}. Each additional level of reasoning shades the guess further down — this is the essence of level-k thinking: you're not modeling the true optimum directly, you're modeling how many steps of reasoning the crowd will actually do.`,
    },
    {
      id: 'beautycontest-nash',
      gameId: GAME_ID,
      type: 'level-k-reasoning',
      prompt: 'If every player has common knowledge of rationality and reasons through infinitely many levels, what is the unique Nash equilibrium guess?',
      concept: 'nash-equilibrium',
      locator: { kind: 'none' },
      answer: { kind: 'multiple-choice', options: nashOptions, correctIndex },
      misconceptions: [],
      explanation: `Iterating "${fractionLabel} of the average" indefinitely converges to 0 — the only guess from which no player wants to deviate. In practice, real players rarely reason past 1-2 levels, which is why winning guesses in actual experiments tend to cluster well above 0. The gap between the Nash prediction and real behavior is exactly what level-k reasoning is designed to explain.`,
    },
  ]

  return { game, questions }
}
