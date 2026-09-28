import type { GameDefinition } from '../../types/game'
import type { Question } from '../../types/question'

export const game: GameDefinition = {
  id: 'ranked-coordination',
  title: 'Ranked Coordination',
  shortDescription:
    'Two firms each choose which technology standard to adopt. Matching on the newer standard benefits both more than matching on the old one — but a mismatch is costly either way, so nobody wants to move first.',
  concepts: ['nash-equilibrium', 'nash-vs-pareto'],
  representation: {
    kind: 'normal-form',
    players: ['Row', 'Col'],
    strategies: { Row: ['New Standard', 'Old Standard'], Col: ['New Standard', 'Old Standard'] },
    payoffs: {
      'New Standard|New Standard': [4, 4],
      'New Standard|Old Standard': [0, 0],
      'Old Standard|New Standard': [0, 0],
      'Old Standard|Old Standard': [2, 2],
    },
  },
}

export const questions: Question[] = [
  {
    id: 'rankedcoord-best-response-col-new',
    gameId: game.id,
    type: 'best-response',
    prompt: 'If Column adopts the New Standard, what is Row\'s best response?',
    concept: 'nash-equilibrium',
    locator: { kind: 'col', col: 'New Standard' },
    subjectPlayer: 'Row',
    answer: { kind: 'strategy', correct: 'New Standard' },
    misconceptions: [],
    explanation: 'Matching on New Standard gives Row 4, the best payoff available anywhere in the game.',
  },
  {
    id: 'rankedcoord-best-response-col-old',
    gameId: game.id,
    type: 'best-response',
    prompt: 'If Column adopts the Old Standard, what is Row\'s best response?',
    concept: 'nash-equilibrium',
    locator: { kind: 'col', col: 'Old Standard' },
    subjectPlayer: 'Row',
    answer: { kind: 'strategy', correct: 'Old Standard' },
    misconceptions: [],
    explanation: 'If Column is on the Old Standard, matching gives Row 2, versus 0 for mismatching by going New.',
  },
  {
    id: 'rankedcoord-dominant-strategy-row',
    gameId: game.id,
    type: 'dominant-strategy',
    prompt: 'Does Row have a dominant strategy? If so, which one?',
    concept: 'dominant-strategy',
    locator: { kind: 'none' },
    subjectPlayer: 'Row',
    answer: { kind: 'strategy-or-none', correct: null },
    misconceptions: [],
    explanation:
      'Row wants to match Column either way, so the best response flips depending on Column\'s choice — no dominant strategy, even though New Standard is the better outcome if coordination succeeds.',
  },
  {
    id: 'rankedcoord-nash-equilibrium',
    gameId: game.id,
    type: 'nash-equilibrium-cell',
    prompt: 'Select all pure-strategy Nash equilibria.',
    concept: 'nash-equilibrium',
    locator: { kind: 'none' },
    answer: {
      kind: 'cell-set',
      correct: [
        { row: 'New Standard', col: 'New Standard' },
        { row: 'Old Standard', col: 'Old Standard' },
      ],
    },
    misconceptions: [],
    explanation:
      'Both matched outcomes are equilibria — but they are not equally good. This is what separates Ranked Coordination from Pure Coordination: the equilibria are ranked by payoff.',
  },
  {
    id: 'rankedcoord-pareto-optimal',
    gameId: game.id,
    type: 'pareto-comparison',
    prompt: 'Select all Pareto-optimal cells.',
    concept: 'nash-vs-pareto',
    locator: { kind: 'none' },
    answer: {
      kind: 'cell-set',
      correct: [{ row: 'New Standard', col: 'New Standard' }],
    },
    misconceptions: [],
    explanation:
      'Only (New Standard, New Standard) is Pareto optimal — it Pareto-dominates every other cell, including the other equilibrium (Old Standard, Old Standard). Unlike Stag Hunt, there\'s no off-diagonal payoff asymmetry creating a risk-dominance argument for the safer equilibrium here: Old Standard is simply worse for both players if they could coordinate on New instead.',
  },
]
