import type { GameDefinition } from '../../types/game'
import type { Question } from '../../types/question'

export const game: GameDefinition = {
  id: 'prisoners-dilemma',
  title: "Prisoner's Dilemma",
  shortDescription:
    'Two suspects are interrogated separately. Each is individually better off betraying the other, even though mutual silence would leave them both better off.',
  concepts: ['dominant-strategy', 'nash-equilibrium', 'nash-vs-pareto'],
  representation: {
    kind: 'normal-form',
    players: ['Row', 'Col'],
    strategies: { Row: ['Stay Silent', 'Betray'], Col: ['Stay Silent', 'Betray'] },
    payoffs: {
      'Stay Silent|Stay Silent': [3, 3],
      'Stay Silent|Betray': [0, 5],
      'Betray|Stay Silent': [5, 0],
      'Betray|Betray': [1, 1],
    },
  },
}

export const questions: Question[] = [
  {
    id: 'pd-best-response-col-silent',
    gameId: game.id,
    type: 'best-response',
    prompt: "If Column stays silent, what is Row's best response?",
    concept: 'dominant-strategy',
    locator: { kind: 'col', col: 'Stay Silent' },
    subjectPlayer: 'Row',
    answer: { kind: 'strategy', correct: 'Betray' },
    misconceptions: [],
    explanation: 'Betraying gives Row 5 instead of 3 if Column stays silent, so it beats staying silent here.',
  },
  {
    id: 'pd-best-response-col-betray',
    gameId: game.id,
    type: 'best-response',
    prompt: "If Column betrays, what is Row's best response?",
    concept: 'dominant-strategy',
    locator: { kind: 'col', col: 'Betray' },
    subjectPlayer: 'Row',
    answer: { kind: 'strategy', correct: 'Betray' },
    misconceptions: [],
    explanation: 'Betraying gives Row 1 instead of 0 if Column also betrays, so it still beats staying silent.',
  },
  {
    id: 'pd-dominant-strategy-row',
    gameId: game.id,
    type: 'dominant-strategy',
    prompt: 'Does Row have a dominant strategy? If so, which one?',
    concept: 'dominant-strategy',
    locator: { kind: 'none' },
    subjectPlayer: 'Row',
    answer: { kind: 'strategy-or-none', correct: 'Betray' },
    misconceptions: [],
    explanation:
      "Betray strictly beats Stay Silent against both of Column's strategies (5>3 and 1>0), so it strictly dominates — Row should betray no matter what Column does.",
  },
  {
    id: 'pd-nash-equilibrium',
    gameId: game.id,
    type: 'nash-equilibrium-cell',
    prompt: 'Select all pure-strategy Nash equilibria.',
    concept: 'nash-equilibrium',
    locator: { kind: 'none' },
    answer: { kind: 'cell-set', correct: [{ row: 'Betray', col: 'Betray' }] },
    misconceptions: [],
    explanation:
      '(Betray, Betray) is the only cell where neither player can gain by unilaterally switching strategies — from there, switching to Stay Silent drops your own payoff from 1 to 0.',
  },
  {
    id: 'pd-pareto-optimal',
    gameId: game.id,
    type: 'pareto-comparison',
    prompt: 'Select all Pareto-optimal cells (no other cell makes both players at least as well off, and one strictly better).',
    concept: 'nash-vs-pareto',
    locator: { kind: 'none' },
    answer: {
      kind: 'cell-set',
      correct: [
        { row: 'Stay Silent', col: 'Stay Silent' },
        { row: 'Stay Silent', col: 'Betray' },
        { row: 'Betray', col: 'Stay Silent' },
      ],
    },
    misconceptions: [],
    explanation:
      'Mutual betrayal (1,1) is Pareto-dominated by mutual silence (3,3) — both players do better there. The other three cells are all Pareto optimal: none of them can be improved for both players simultaneously. This is the heart of the dilemma: the unique Nash equilibrium (Betray, Betray) is the one Pareto-inefficient outcome.',
  },
]
