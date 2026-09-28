import type { GameDefinition } from '../../types/game'
import type { Question } from '../../types/question'

export const game: GameDefinition = {
  id: 'stag-hunt',
  title: 'Stag Hunt',
  shortDescription:
    'Two hunters can cooperate to catch a stag (high reward, but only if both commit) or each individually catch a hare (safe, lower reward). Unlike Prisoner\'s Dilemma, mutual cooperation is an equilibrium here — but so is mutual caution.',
  concepts: ['nash-equilibrium', 'nash-vs-pareto'],
  representation: {
    kind: 'normal-form',
    players: ['Row', 'Col'],
    strategies: { Row: ['Stag', 'Hare'], Col: ['Stag', 'Hare'] },
    payoffs: {
      'Stag|Stag': [4, 4],
      'Stag|Hare': [0, 3],
      'Hare|Stag': [3, 0],
      'Hare|Hare': [2, 2],
    },
  },
}

export const questions: Question[] = [
  {
    id: 'stag-best-response-col-stag',
    gameId: game.id,
    type: 'best-response',
    prompt: 'If Column hunts Stag, what is Row\'s best response?',
    concept: 'nash-equilibrium',
    locator: { kind: 'col', col: 'Stag' },
    subjectPlayer: 'Row',
    answer: { kind: 'strategy', correct: 'Stag' },
    misconceptions: [],
    explanation: 'If Column commits to Stag, Row gets 4 by also hunting Stag versus 3 by hunting Hare.',
  },
  {
    id: 'stag-best-response-col-hare',
    gameId: game.id,
    type: 'best-response',
    prompt: 'If Column hunts Hare, what is Row\'s best response?',
    concept: 'nash-equilibrium',
    locator: { kind: 'col', col: 'Hare' },
    subjectPlayer: 'Row',
    answer: { kind: 'strategy', correct: 'Hare' },
    misconceptions: [],
    explanation:
      'If Column hunts Hare, Row only gets 0 by hunting Stag alone versus 2 by also hunting Hare — best response flips depending on what Column does, which is exactly why there\'s no dominant strategy here.',
  },
  {
    id: 'stag-dominant-strategy-row',
    gameId: game.id,
    type: 'dominant-strategy',
    prompt: 'Does Row have a dominant strategy? If so, which one?',
    concept: 'dominant-strategy',
    locator: { kind: 'none' },
    subjectPlayer: 'Row',
    answer: { kind: 'strategy-or-none', correct: null },
    misconceptions: [],
    explanation:
      "Row's best response depends on what Column does (Stag if Column plays Stag, Hare if Column plays Hare), so neither strategy dominates the other — there is no dominant strategy in Stag Hunt.",
  },
  {
    id: 'stag-nash-equilibrium',
    gameId: game.id,
    type: 'nash-equilibrium-cell',
    prompt: 'Select all pure-strategy Nash equilibria.',
    concept: 'nash-equilibrium',
    locator: { kind: 'none' },
    answer: {
      kind: 'cell-set',
      correct: [
        { row: 'Stag', col: 'Stag' },
        { row: 'Hare', col: 'Hare' },
      ],
    },
    misconceptions: [],
    explanation:
      'Both (Stag, Stag) and (Hare, Hare) are self-reinforcing: at either, neither player gains by switching alone. This is the classic coordination tension — the higher-payoff equilibrium requires trusting your partner to also commit.',
  },
  {
    id: 'stag-pareto-optimal',
    gameId: game.id,
    type: 'pareto-comparison',
    prompt: 'Select all Pareto-optimal cells.',
    concept: 'nash-vs-pareto',
    locator: { kind: 'none' },
    answer: {
      kind: 'cell-set',
      correct: [{ row: 'Stag', col: 'Stag' }],
    },
    misconceptions: [],
    explanation:
      'Every other cell is Pareto-dominated by (Stag, Stag) at (4,4) — including (Hare, Hare) at (2,2), where both players would do strictly better if they could both switch to Stag. So even though (Hare, Hare) is a Nash equilibrium, it is not Pareto optimal: it\'s the "safe but inefficient" equilibrium that risk-averse players may settle for.',
  },
]
