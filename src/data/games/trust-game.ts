import { backwardInduction } from '../../engine/gameUtils'
import { randInt } from '../../engine/random'
import type { RNG } from '../../engine/random'
import type { ExtensiveFormGame, GameDefinition } from '../../types/game'
import type { Question } from '../../types/question'

const GAME_ID = 'trust-game'
const [INVESTOR, TRUSTEE] = ['Investor', 'Trustee']

/**
 * Generates payoffs where Betray beats Honor for the Trustee (so trust unravels),
 * Not-Trust beats the Betray outcome for the Investor, and Honor beats Not-Trust for
 * both (so cooperation would genuinely have been mutually better, matching the
 * "unrealized Pareto improvement" narrative).
 */
function generatePayoffs(rng: RNG) {
  const a = randInt(rng, 3, 7) // Not Trust (both)
  const bi = randInt(rng, 0, a - 1) // Investor's betrayed payoff
  const hi = randInt(rng, a + 1, a + 6) // Investor's honored payoff
  const ht = randInt(rng, a + 1, a + 6) // Trustee's honored payoff
  const bt = randInt(rng, ht + 1, ht + 6) // Trustee's betrayed payoff
  return { a, bi, hi, ht, bt }
}

export function generateInstance(rng: RNG = Math.random): { game: GameDefinition; questions: Question[] } {
  const { a, bi, hi, ht, bt } = generatePayoffs(rng)

  const representation: ExtensiveFormGame = {
    kind: 'extensive-form',
    players: [INVESTOR, TRUSTEE],
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        type: 'decision',
        player: INVESTOR,
        actions: [
          { label: 'Trust', targetNodeId: 'trustee-node' },
          { label: 'Not Trust', targetNodeId: 'no-trust' },
        ],
      },
      'trustee-node': {
        id: 'trustee-node',
        type: 'decision',
        player: TRUSTEE,
        actions: [
          { label: 'Honor', targetNodeId: 'honor' },
          { label: 'Betray', targetNodeId: 'betray' },
        ],
      },
      'no-trust': { id: 'no-trust', type: 'terminal', payoffs: { [INVESTOR]: a, [TRUSTEE]: a } },
      honor: { id: 'honor', type: 'terminal', payoffs: { [INVESTOR]: hi, [TRUSTEE]: ht } },
      betray: { id: 'betray', type: 'terminal', payoffs: { [INVESTOR]: bi, [TRUSTEE]: bt } },
    },
  }

  const game: GameDefinition = {
    id: GAME_ID,
    title: 'Trust Game',
    shortDescription:
      'An Investor can trust a Trustee with a windfall that grows if both cooperate, or keep a smaller safe amount for themselves. If the Investor trusts, the Trustee then chooses whether to honor that trust or keep everything.',
    concepts: ['backward-induction', 'nash-vs-pareto'],
    representation,
  }

  const solved = backwardInduction(representation)

  const questions: Question[] = [
    {
      id: 'trust-trustee-decision',
      gameId: GAME_ID,
      type: 'node-decision',
      prompt: 'If the Investor trusts, what should the Trustee do?',
      concept: 'backward-induction',
      locator: { kind: 'node', nodeId: 'trustee-node' },
      answer: { kind: 'action', correct: solved['trustee-node'].action ?? 'Betray' },
      misconceptions: [],
      explanation: `Betraying gives the Trustee ${bt} instead of ${ht} from honoring — once the money has already been sent, honoring the deal is not in the Trustee's self-interest.`,
    },
    {
      id: 'trust-investor-decision',
      gameId: GAME_ID,
      type: 'node-decision',
      prompt: 'Anticipating that the Trustee will betray, what should the Investor do at the start?',
      concept: 'backward-induction',
      locator: { kind: 'node', nodeId: 'root' },
      answer: { kind: 'action', correct: solved.root.action ?? 'Not Trust' },
      misconceptions: [],
      explanation: `Trusting leads to betrayal, which nets the Investor only ${bi} — worse than the safe ${a} from not trusting. The mutually best outcome (${hi}, ${ht}) is never reached: like Prisoner's Dilemma, backward induction unravels cooperation even though both players would prefer it.`,
    },
  ]

  return { game, questions }
}
