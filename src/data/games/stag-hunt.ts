import { computeDominantStrategy, computeNashEquilibria, allParetoOptimalCells } from '../../engine/gameUtils'
import { randInt } from '../../engine/random'
import type { RNG } from '../../engine/random'
import type { GameDefinition, NormalFormGame } from '../../types/game'
import type { Question } from '../../types/question'

const GAME_ID = 'stag-hunt'
const [ROW, COL] = ['Row', 'Col']
const [STAG, HARE] = ['Stag', 'Hare']

/**
 * Generates payoffs where Stag is the best response to Stag and Hare is the best
 * response to Hare (the dual-equilibrium structure), with mutual Stag as the global
 * max — so (Stag, Stag) stays the unique Pareto-optimal cell no matter the draw.
 */
function generatePayoffs(rng: RNG) {
  const z = randInt(rng, 0, 2) // lone stag hunter (abandoned)
  const x = randInt(rng, 0, 4) // opportunist hunting hare while other hunts stag
  const y = randInt(rng, z + 1, z + 5) // mutual hare
  const w = randInt(rng, Math.max(x, y) + 1, Math.max(x, y) + 5) // mutual stag
  return { w, x, y, z }
}

export function generateInstance(rng: RNG = Math.random): { game: GameDefinition; questions: Question[] } {
  const { w, x, y, z } = generatePayoffs(rng)

  const representation: NormalFormGame = {
    kind: 'normal-form',
    players: [ROW, COL],
    strategies: { [ROW]: [STAG, HARE], [COL]: [STAG, HARE] },
    payoffs: {
      [`${STAG}|${STAG}`]: [w, w],
      [`${STAG}|${HARE}`]: [z, x],
      [`${HARE}|${STAG}`]: [x, z],
      [`${HARE}|${HARE}`]: [y, y],
    },
  }

  const game: GameDefinition = {
    id: GAME_ID,
    title: 'Stag Hunt',
    shortDescription:
      "Two hunters can cooperate to catch a stag (high reward, but only if both commit) or each individually catch a hare (safe, lower reward). Unlike Prisoner's Dilemma, mutual cooperation is an equilibrium here — but so is mutual caution.",
    concepts: ['nash-equilibrium', 'nash-vs-pareto'],
    representation,
  }

  const dominant = computeDominantStrategy(representation, 0)
  const nash = computeNashEquilibria(representation)
  const pareto = allParetoOptimalCells(representation)

  const questions: Question[] = [
    {
      id: 'stag-best-response-col-stag',
      gameId: GAME_ID,
      type: 'best-response',
      prompt: "If Column hunts Stag, what is Row's best response?",
      concept: 'nash-equilibrium',
      locator: { kind: 'col', col: STAG },
      subjectPlayer: ROW,
      answer: { kind: 'strategy', correct: STAG },
      misconceptions: [],
      explanation: `If Column commits to Stag, Row gets ${w} by also hunting Stag versus ${x} by hunting Hare.`,
    },
    {
      id: 'stag-best-response-col-hare',
      gameId: GAME_ID,
      type: 'best-response',
      prompt: "If Column hunts Hare, what is Row's best response?",
      concept: 'nash-equilibrium',
      locator: { kind: 'col', col: HARE },
      subjectPlayer: ROW,
      answer: { kind: 'strategy', correct: HARE },
      misconceptions: [],
      explanation: `If Column hunts Hare, Row only gets ${z} by hunting Stag alone versus ${y} by also hunting Hare — best response flips depending on what Column does, which is exactly why there's no dominant strategy here.`,
    },
    {
      id: 'stag-dominant-strategy-row',
      gameId: GAME_ID,
      type: 'dominant-strategy',
      prompt: 'Does Row have a dominant strategy? If so, which one?',
      concept: 'dominant-strategy',
      locator: { kind: 'none' },
      subjectPlayer: ROW,
      answer: { kind: 'strategy-or-none', correct: dominant },
      misconceptions: [],
      explanation:
        "Row's best response depends on what Column does (Stag if Column plays Stag, Hare if Column plays Hare), so neither strategy dominates the other — there is no dominant strategy in Stag Hunt.",
    },
    {
      id: 'stag-nash-equilibrium',
      gameId: GAME_ID,
      type: 'nash-equilibrium-cell',
      prompt: 'Select all pure-strategy Nash equilibria.',
      concept: 'nash-equilibrium',
      locator: { kind: 'none' },
      answer: { kind: 'cell-set', correct: nash },
      misconceptions: [],
      explanation:
        'Both (Stag, Stag) and (Hare, Hare) are self-reinforcing: at either, neither player gains by switching alone. This is the classic coordination tension — the higher-payoff equilibrium requires trusting your partner to also commit.',
    },
    {
      id: 'stag-pareto-optimal',
      gameId: GAME_ID,
      type: 'pareto-comparison',
      prompt: 'Select all Pareto-optimal cells.',
      concept: 'nash-vs-pareto',
      locator: { kind: 'none' },
      answer: { kind: 'cell-set', correct: pareto },
      misconceptions: [],
      explanation: `Every other cell is Pareto-dominated by (Stag, Stag) at (${w},${w}) — including (Hare, Hare) at (${y},${y}), where both players would do strictly better if they could both switch to Stag. So even though (Hare, Hare) is a Nash equilibrium, it is not Pareto optimal: it's the "safe but inefficient" equilibrium that risk-averse players may settle for.`,
    },
  ]

  return { game, questions }
}
