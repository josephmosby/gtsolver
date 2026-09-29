import { backwardInduction } from '../../engine/gameUtils'
import { randInt } from '../../engine/random'
import type { RNG } from '../../engine/random'
import type { ExtensiveFormGame, GameDefinition } from '../../types/game'
import type { Question } from '../../types/question'

const GAME_ID = 'bank-run'
const [DEPOSITOR_A, DEPOSITOR_B] = ['Depositor A', 'Depositor B']

/**
 * Generates payoffs where joining a run beats waiting once A has already withdrawn
 * (r > 0), mutual waiting beats being the lone early withdrawer (g > e1) and beats
 * joining a run (g > r) — so B always matches whatever A did, and A always prefers
 * to wait first.
 */
function generatePayoffs(rng: RNG) {
  const r = randInt(rng, 1, 3) // both withdraw (symmetric)
  const e1 = randInt(rng, r + 1, r + 3) // lone early withdrawer
  const g = randInt(rng, e1 + 1, e1 + 4) // both wait (symmetric)
  return { r, e1, g }
}

export function generateInstance(rng: RNG = Math.random): { game: GameDefinition; questions: Question[] } {
  const { r, e1, g } = generatePayoffs(rng)

  const representation: ExtensiveFormGame = {
    kind: 'extensive-form',
    players: [DEPOSITOR_A, DEPOSITOR_B],
    rootId: 'root',
    nodes: {
      root: {
        id: 'root',
        type: 'decision',
        player: DEPOSITOR_A,
        actions: [
          { label: 'Withdraw', targetNodeId: 'b-after-withdraw' },
          { label: 'Wait', targetNodeId: 'b-after-wait' },
        ],
      },
      'b-after-withdraw': {
        id: 'b-after-withdraw',
        type: 'decision',
        player: DEPOSITOR_B,
        actions: [
          { label: 'Withdraw', targetNodeId: 'both-withdraw' },
          { label: 'Wait', targetNodeId: 'a-out-b-wiped' },
        ],
      },
      'b-after-wait': {
        id: 'b-after-wait',
        type: 'decision',
        player: DEPOSITOR_B,
        actions: [
          { label: 'Withdraw', targetNodeId: 'b-out-a-wiped' },
          { label: 'Wait', targetNodeId: 'both-wait' },
        ],
      },
      'both-withdraw': { id: 'both-withdraw', type: 'terminal', payoffs: { [DEPOSITOR_A]: r, [DEPOSITOR_B]: r } },
      'a-out-b-wiped': { id: 'a-out-b-wiped', type: 'terminal', payoffs: { [DEPOSITOR_A]: e1, [DEPOSITOR_B]: 0 } },
      'b-out-a-wiped': { id: 'b-out-a-wiped', type: 'terminal', payoffs: { [DEPOSITOR_A]: 0, [DEPOSITOR_B]: e1 } },
      'both-wait': { id: 'both-wait', type: 'terminal', payoffs: { [DEPOSITOR_A]: g, [DEPOSITOR_B]: g } },
    },
  }

  const game: GameDefinition = {
    id: GAME_ID,
    title: 'Bank Run',
    shortDescription:
      'Two depositors hold funds in a bank whose reserves can only cover one early withdrawal in full. Simplified into a sequential game — Depositor A moves first and Depositor B observes before deciding — to ask whether observability can prevent a self-fulfilling run.',
    concepts: ['backward-induction'],
    representation,
  }

  const solved = backwardInduction(representation)

  const questions: Question[] = [
    {
      id: 'bankrun-b-after-withdraw',
      gameId: GAME_ID,
      type: 'node-decision',
      prompt: 'If Depositor A withdraws early, what should Depositor B do?',
      concept: 'backward-induction',
      locator: { kind: 'node', nodeId: 'b-after-withdraw' },
      answer: { kind: 'action', correct: solved['b-after-withdraw'].action ?? 'Withdraw' },
      misconceptions: [],
      explanation: `Once A has already pulled out, the bank's reserves are gone — waiting nets B only 0, while also withdrawing immediately nets ${r}. B should join the run.`,
    },
    {
      id: 'bankrun-b-after-wait',
      gameId: GAME_ID,
      type: 'node-decision',
      prompt: 'If Depositor A waits, what should Depositor B do?',
      concept: 'backward-induction',
      locator: { kind: 'node', nodeId: 'b-after-wait' },
      answer: { kind: 'action', correct: solved['b-after-wait'].action ?? 'Wait' },
      misconceptions: [],
      explanation: `With A's deposit still in the bank, waiting yields B the full patient payoff of ${g}, versus ${e1} for withdrawing early. There's no reason to panic if the other depositor hasn't.`,
    },
    {
      id: 'bankrun-a-decision',
      gameId: GAME_ID,
      type: 'node-decision',
      prompt: "Anticipating Depositor B's best response either way, what should Depositor A do first?",
      concept: 'backward-induction',
      locator: { kind: 'node', nodeId: 'root' },
      answer: { kind: 'action', correct: solved.root.action ?? 'Wait' },
      misconceptions: [],
      explanation: `Withdrawing early triggers B to also withdraw (both get ${r}), but waiting leads B to wait too (both get ${g}) — so waiting is strictly better for A. Because B can observe A's choice before acting, the sequential structure lets both depositors reach the run-free outcome, unlike a simultaneous-move version where uncertainty about the other's action can create a self-fulfilling panic.`,
    },
  ]

  return { game, questions }
}
