import { backwardInduction } from '../../engine/gameUtils'
import { randInt } from '../../engine/random'
import type { RNG } from '../../engine/random'
import type { ExtensiveFormGame, GameDefinition } from '../../types/game'
import type { Question } from '../../types/question'

const GAME_ID = 'market-entry'
const [ENTRANT, INCUMBENT] = ['Entrant', 'Incumbent']

/**
 * Generates payoffs where Accommodate beats Fight for the Incumbent (so the fight
 * threat isn't credible), Accommodate beats Stay Out for the Entrant (entry is worth
 * it once accommodation is anticipated), and Monopoly beats Accommodate for the
 * Incumbent (so staying out is genuinely their best-case scenario).
 */
function generatePayoffs(rng: RNG) {
  const ai = randInt(rng, 1, 4) // Incumbent's accommodate payoff
  const fi = randInt(rng, -3, ai - 1) // Incumbent's fight payoff
  const m = randInt(rng, ai + 1, ai + 5) // Incumbent's monopoly (stay-out) payoff
  const ae = randInt(rng, 1, 4) // Entrant's accommodate payoff
  const fe = randInt(rng, -5, -1) // Entrant's fight payoff
  return { ai, fi, m, ae, fe }
}

export function generateInstance(rng: RNG = Math.random): { game: GameDefinition; questions: Question[] } {
  const { ai, fi, m, ae, fe } = generatePayoffs(rng)

  const representation: ExtensiveFormGame = {
    kind: 'extensive-form',
    players: [ENTRANT, INCUMBENT],
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        type: 'decision',
        player: ENTRANT,
        actions: [
          { label: 'Enter', targetNodeId: 'incumbent-node' },
          { label: 'Stay Out', targetNodeId: 'stay-out' },
        ],
      },
      'incumbent-node': {
        id: 'incumbent-node',
        type: 'decision',
        player: INCUMBENT,
        actions: [
          { label: 'Fight', targetNodeId: 'fight' },
          { label: 'Accommodate', targetNodeId: 'accommodate' },
        ],
      },
      'stay-out': { id: 'stay-out', type: 'terminal', payoffs: { [ENTRANT]: 0, [INCUMBENT]: m } },
      fight: { id: 'fight', type: 'terminal', payoffs: { [ENTRANT]: fe, [INCUMBENT]: fi } },
      accommodate: { id: 'accommodate', type: 'terminal', payoffs: { [ENTRANT]: ae, [INCUMBENT]: ai } },
    },
  }

  const game: GameDefinition = {
    id: GAME_ID,
    title: 'Market Entry',
    shortDescription:
      'An Entrant decides whether to enter a market currently held by an Incumbent. If the Entrant enters, the Incumbent must decide whether to fight (a costly price war) or accommodate (share the market peacefully).',
    concepts: ['backward-induction'],
    representation,
  }

  const solved = backwardInduction(representation)

  const questions: Question[] = [
    {
      id: 'marketentry-incumbent-decision',
      gameId: GAME_ID,
      type: 'node-decision',
      prompt: 'If the Entrant enters, what should the Incumbent do?',
      concept: 'backward-induction',
      locator: { kind: 'node', nodeId: 'incumbent-node' },
      answer: { kind: 'action', correct: solved['incumbent-node'].action ?? 'Accommodate' },
      misconceptions: [],
      explanation: `Fighting nets the Incumbent ${fi} versus ${ai} for accommodating — once entry has actually happened, a price war only destroys value for the Incumbent too. The threat to fight is not credible.`,
    },
    {
      id: 'marketentry-entrant-decision',
      gameId: GAME_ID,
      type: 'node-decision',
      prompt: "Knowing the Incumbent's threat to fight isn't credible, what should the Entrant do?",
      concept: 'backward-induction',
      locator: { kind: 'node', nodeId: 'root' },
      answer: { kind: 'action', correct: solved.root.action ?? 'Enter' },
      misconceptions: [],
      explanation: `Since the Incumbent will accommodate rather than fight if entry actually occurs, entering nets the Entrant ${ae} — better than the 0 from staying out. A threat that isn't optimal to carry out shouldn't change a rational Entrant's decision, even if the Incumbent announces it beforehand.`,
    },
  ]

  return { game, questions }
}
