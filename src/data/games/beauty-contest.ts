import type { GameDefinition } from '../../types/game'
import type { Question } from '../../types/question'

export const game: GameDefinition = {
  id: 'beauty-contest',
  title: "Keynes' Beauty Contest",
  shortDescription:
    "Every player picks a number from 0 to 100. The winner is whoever picks closest to two-thirds of the average of all guesses. Success depends not on your own reasoning alone, but on correctly modeling how deep everyone else's reasoning goes.",
  concepts: ['level-k-reasoning', 'nash-equilibrium'],
  representation: {
    kind: 'scenario',
    players: ['You', 'The Crowd'],
    setupText:
      'A large group of players each secretly picks a number between 0 and 100. The winner is whoever\'s guess is closest to two-thirds (2/3) of the average of everyone\'s guesses.',
    parameters: { targetFraction: 0.6667, rangeMin: 0, rangeMax: 100 },
  },
}

export const questions: Question[] = [
  {
    id: 'beautycontest-level1',
    gameId: game.id,
    type: 'level-k-choice',
    prompt:
      "A \"level-0\" player guesses randomly, averaging around 50 (the middle of the range). What number would a \"level-1\" player guess — one who assumes everyone else is level-0 and best-responds to that?",
    concept: 'level-k-reasoning',
    locator: { kind: 'none' },
    answer: { kind: 'numeric', correct: 33.3, tolerance: 1.5 },
    misconceptions: [],
    explanation:
      'Two-thirds of the level-0 average of 50 is about 33.3. A level-1 player reasons one step further than the naive crowd and shades their guess down accordingly.',
  },
  {
    id: 'beautycontest-level2',
    gameId: game.id,
    type: 'level-k-choice',
    prompt:
      'What would a "level-2" player guess — one who assumes everyone else is level-1 (guessing about 33) and best-responds to that?',
    concept: 'level-k-reasoning',
    locator: { kind: 'none' },
    answer: { kind: 'numeric', correct: 22.2, tolerance: 2 },
    misconceptions: [],
    explanation:
      'Two-thirds of 33.3 is about 22.2. Each additional level of reasoning shades the guess further down — this is the essence of level-k thinking: you\'re not modeling the true optimum directly, you\'re modeling how many steps of reasoning the crowd will actually do.',
  },
  {
    id: 'beautycontest-nash',
    gameId: game.id,
    type: 'level-k-reasoning',
    prompt:
      'If every player has common knowledge of rationality and reasons through infinitely many levels, what is the unique Nash equilibrium guess?',
    concept: 'nash-equilibrium',
    locator: { kind: 'none' },
    answer: { kind: 'multiple-choice', options: ['0', '22', '33', '50'], correctIndex: 0 },
    misconceptions: [],
    explanation:
      'Iterating "two-thirds of the average" indefinitely converges to 0 — the only guess from which no player wants to deviate. In practice, real players rarely reason past 1-2 levels, which is why winning guesses in actual experiments tend to cluster around 20-35, not 0. The gap between the Nash prediction and real behavior is exactly what level-k reasoning is designed to explain.',
  },
]
