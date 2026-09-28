import type { GameDefinition } from '../../types/game'
import type { Question } from '../../types/question'

export const game: GameDefinition = {
  id: 'pure-coordination',
  title: 'Pure Coordination',
  shortDescription:
    'Two drivers approaching each other must both pick Left or Right. Matching is all that matters — there\'s no reason to prefer one matched outcome over the other, unlike Ranked Coordination.',
  concepts: ['nash-equilibrium', 'nash-vs-pareto'],
  representation: {
    kind: 'normal-form',
    players: ['Row', 'Col'],
    strategies: { Row: ['Left', 'Right'], Col: ['Left', 'Right'] },
    payoffs: {
      'Left|Left': [1, 1],
      'Left|Right': [0, 0],
      'Right|Left': [0, 0],
      'Right|Right': [1, 1],
    },
  },
}

export const questions: Question[] = [
  {
    id: 'purecoord-best-response-col-left',
    gameId: game.id,
    type: 'best-response',
    prompt: 'If Column picks Left, what is Row\'s best response?',
    concept: 'nash-equilibrium',
    locator: { kind: 'col', col: 'Left' },
    subjectPlayer: 'Row',
    answer: { kind: 'strategy', correct: 'Left' },
    misconceptions: [],
    explanation: 'Matching Column\'s Left gives Row 1 instead of 0, so Row should also pick Left.',
  },
  {
    id: 'purecoord-best-response-col-right',
    gameId: game.id,
    type: 'best-response',
    prompt: 'If Column picks Right, what is Row\'s best response?',
    concept: 'nash-equilibrium',
    locator: { kind: 'col', col: 'Right' },
    subjectPlayer: 'Row',
    answer: { kind: 'strategy', correct: 'Right' },
    misconceptions: [],
    explanation: 'Best response flips to match whatever Column does — there\'s no fixed preferred action independent of Column\'s choice.',
  },
  {
    id: 'purecoord-dominant-strategy-row',
    gameId: game.id,
    type: 'dominant-strategy',
    prompt: 'Does Row have a dominant strategy? If so, which one?',
    concept: 'dominant-strategy',
    locator: { kind: 'none' },
    subjectPlayer: 'Row',
    answer: { kind: 'strategy-or-none', correct: null },
    misconceptions: [],
    explanation: 'Row\'s best action depends entirely on what Column does, so neither Left nor Right dominates the other.',
  },
  {
    id: 'purecoord-nash-equilibrium',
    gameId: game.id,
    type: 'nash-equilibrium-cell',
    prompt: 'Select all pure-strategy Nash equilibria.',
    concept: 'nash-equilibrium',
    locator: { kind: 'none' },
    answer: {
      kind: 'cell-set',
      correct: [
        { row: 'Left', col: 'Left' },
        { row: 'Right', col: 'Right' },
      ],
    },
    misconceptions: [],
    explanation:
      'Both matched outcomes are equilibria: at either, switching alone only causes a mismatch and drops your payoff from 1 to 0. With no way to communicate, players must rely on a focal point to land on the same one.',
  },
  {
    id: 'purecoord-pareto-optimal',
    gameId: game.id,
    type: 'pareto-comparison',
    prompt: 'Select all Pareto-optimal cells.',
    concept: 'nash-vs-pareto',
    locator: { kind: 'none' },
    answer: {
      kind: 'cell-set',
      correct: [
        { row: 'Left', col: 'Left' },
        { row: 'Right', col: 'Right' },
      ],
    },
    misconceptions: [],
    explanation:
      'Unlike Stag Hunt or Ranked Coordination, the two equilibria here are payoff-identical — both are Pareto optimal, and neither Pareto-dominates the other. The only problem is coordinating on which one.',
  },
]
