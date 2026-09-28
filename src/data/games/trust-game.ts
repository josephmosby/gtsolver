import type { GameDefinition } from '../../types/game'
import type { Question } from '../../types/question'

export const game: GameDefinition = {
  id: 'trust-game',
  title: 'Trust Game',
  shortDescription:
    'An Investor can trust a Trustee with a windfall that grows if both cooperate, or keep a smaller safe amount for themselves. If the Investor trusts, the Trustee then chooses whether to honor that trust or keep everything.',
  concepts: ['backward-induction', 'nash-vs-pareto'],
  representation: {
    kind: 'extensive-form',
    players: ['Investor', 'Trustee'],
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        type: 'decision',
        player: 'Investor',
        actions: [
          { label: 'Trust', targetNodeId: 'trustee-node' },
          { label: 'Not Trust', targetNodeId: 'no-trust' },
        ],
      },
      'trustee-node': {
        id: 'trustee-node',
        type: 'decision',
        player: 'Trustee',
        actions: [
          { label: 'Honor', targetNodeId: 'honor' },
          { label: 'Betray', targetNodeId: 'betray' },
        ],
      },
      'no-trust': { id: 'no-trust', type: 'terminal', payoffs: { Investor: 5, Trustee: 5 } },
      honor: { id: 'honor', type: 'terminal', payoffs: { Investor: 10, Trustee: 10 } },
      betray: { id: 'betray', type: 'terminal', payoffs: { Investor: 0, Trustee: 15 } },
    },
  },
}

export const questions: Question[] = [
  {
    id: 'trust-trustee-decision',
    gameId: game.id,
    type: 'node-decision',
    prompt: 'If the Investor trusts, what should the Trustee do?',
    concept: 'backward-induction',
    locator: { kind: 'node', nodeId: 'trustee-node' },
    answer: { kind: 'action', correct: 'Betray' },
    misconceptions: [],
    explanation:
      'Betraying gives the Trustee 15 instead of 10 from honoring — once the money has already been sent, honoring the deal is not in the Trustee\'s self-interest.',
  },
  {
    id: 'trust-investor-decision',
    gameId: game.id,
    type: 'node-decision',
    prompt: "Anticipating that the Trustee will betray, what should the Investor do at the start?",
    concept: 'backward-induction',
    locator: { kind: 'node', nodeId: 'root' },
    answer: { kind: 'action', correct: 'Not Trust' },
    misconceptions: [],
    explanation:
      'Trusting leads to betrayal, which nets the Investor only 0 — worse than the safe 5 from not trusting. The mutually best outcome (10, 10) is never reached: like Prisoner\'s Dilemma, backward induction unravels cooperation even though both players would prefer it.',
  },
]
