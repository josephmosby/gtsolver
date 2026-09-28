import type { GameDefinition } from '../../types/game'
import type { Question } from '../../types/question'

export const game: GameDefinition = {
  id: 'market-entry',
  title: 'Market Entry',
  shortDescription:
    'An Entrant decides whether to enter a market currently held by an Incumbent. If the Entrant enters, the Incumbent must decide whether to fight (a costly price war) or accommodate (share the market peacefully).',
  concepts: ['backward-induction'],
  representation: {
    kind: 'extensive-form',
    players: ['Entrant', 'Incumbent'],
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        type: 'decision',
        player: 'Entrant',
        actions: [
          { label: 'Enter', targetNodeId: 'incumbent-node' },
          { label: 'Stay Out', targetNodeId: 'stay-out' },
        ],
      },
      'incumbent-node': {
        id: 'incumbent-node',
        type: 'decision',
        player: 'Incumbent',
        actions: [
          { label: 'Fight', targetNodeId: 'fight' },
          { label: 'Accommodate', targetNodeId: 'accommodate' },
        ],
      },
      'stay-out': { id: 'stay-out', type: 'terminal', payoffs: { Entrant: 0, Incumbent: 5 } },
      fight: { id: 'fight', type: 'terminal', payoffs: { Entrant: -3, Incumbent: 0 } },
      accommodate: { id: 'accommodate', type: 'terminal', payoffs: { Entrant: 2, Incumbent: 2 } },
    },
  },
}

export const questions: Question[] = [
  {
    id: 'marketentry-incumbent-decision',
    gameId: game.id,
    type: 'node-decision',
    prompt: 'If the Entrant enters, what should the Incumbent do?',
    concept: 'backward-induction',
    locator: { kind: 'node', nodeId: 'incumbent-node' },
    answer: { kind: 'action', correct: 'Accommodate' },
    misconceptions: [],
    explanation:
      'Fighting nets the Incumbent 0 versus 2 for accommodating — once entry has actually happened, a price war only destroys value for the Incumbent too. The threat to fight is not credible.',
  },
  {
    id: 'marketentry-entrant-decision',
    gameId: game.id,
    type: 'node-decision',
    prompt: "Knowing the Incumbent's threat to fight isn't credible, what should the Entrant do?",
    concept: 'backward-induction',
    locator: { kind: 'node', nodeId: 'root' },
    answer: { kind: 'action', correct: 'Enter' },
    misconceptions: [],
    explanation:
      'Since the Incumbent will accommodate rather than fight if entry actually occurs, entering nets the Entrant 2 — better than the 0 from staying out. A threat that isn\'t optimal to carry out shouldn\'t change a rational Entrant\'s decision, even if the Incumbent announces it beforehand.',
  },
]
