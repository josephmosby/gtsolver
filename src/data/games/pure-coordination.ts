import { computeDominantStrategy, computeNashEquilibria, allParetoOptimalCells } from '../../engine/gameUtils'
import { randInt } from '../../engine/random'
import type { RNG } from '../../engine/random'
import type { GameDefinition, NormalFormGame } from '../../types/game'
import type { Question } from '../../types/question'

const GAME_ID = 'pure-coordination'
const [ROW, COL] = ['Row', 'Col']
const [LEFT, RIGHT] = ['Left', 'Right']

/** Both matched cells tied at the same value m (no ranking between equilibria, by
 * definition of "pure" coordination), mismatched cells strictly worse at k < m. */
function generatePayoffs(rng: RNG) {
  const m = randInt(rng, 1, 6)
  const k = randInt(rng, 0, m - 1)
  return { m, k }
}

export function generateInstance(rng: RNG = Math.random): { game: GameDefinition; questions: Question[] } {
  const { m, k } = generatePayoffs(rng)

  const representation: NormalFormGame = {
    kind: 'normal-form',
    players: [ROW, COL],
    strategies: { [ROW]: [LEFT, RIGHT], [COL]: [LEFT, RIGHT] },
    payoffs: {
      [`${LEFT}|${LEFT}`]: [m, m],
      [`${LEFT}|${RIGHT}`]: [k, k],
      [`${RIGHT}|${LEFT}`]: [k, k],
      [`${RIGHT}|${RIGHT}`]: [m, m],
    },
  }

  const game: GameDefinition = {
    id: GAME_ID,
    title: 'Pure Coordination',
    shortDescription:
      "Two drivers approaching each other must both pick Left or Right. Matching is all that matters — there's no reason to prefer one matched outcome over the other, unlike Ranked Coordination.",
    concepts: ['nash-equilibrium', 'nash-vs-pareto'],
    representation,
  }

  const dominant = computeDominantStrategy(representation, 0)
  const nash = computeNashEquilibria(representation)
  const pareto = allParetoOptimalCells(representation)

  const questions: Question[] = [
    {
      id: 'purecoord-best-response-col-left',
      gameId: GAME_ID,
      type: 'best-response',
      prompt: "If Column picks Left, what is Row's best response?",
      concept: 'nash-equilibrium',
      locator: { kind: 'col', col: LEFT },
      subjectPlayer: ROW,
      answer: { kind: 'strategy', correct: LEFT },
      misconceptions: [],
      explanation: `Matching Column's Left gives Row ${m} instead of ${k}, so Row should also pick Left.`,
    },
    {
      id: 'purecoord-best-response-col-right',
      gameId: GAME_ID,
      type: 'best-response',
      prompt: "If Column picks Right, what is Row's best response?",
      concept: 'nash-equilibrium',
      locator: { kind: 'col', col: RIGHT },
      subjectPlayer: ROW,
      answer: { kind: 'strategy', correct: RIGHT },
      misconceptions: [],
      explanation: "Best response flips to match whatever Column does — there's no fixed preferred action independent of Column's choice.",
    },
    {
      id: 'purecoord-dominant-strategy-row',
      gameId: GAME_ID,
      type: 'dominant-strategy',
      prompt: 'Does Row have a dominant strategy? If so, which one?',
      concept: 'dominant-strategy',
      locator: { kind: 'none' },
      subjectPlayer: ROW,
      answer: { kind: 'strategy-or-none', correct: dominant },
      misconceptions: [],
      explanation: "Row's best action depends entirely on what Column does, so neither Left nor Right dominates the other.",
    },
    {
      id: 'purecoord-nash-equilibrium',
      gameId: GAME_ID,
      type: 'nash-equilibrium-cell',
      prompt: 'Select all pure-strategy Nash equilibria.',
      concept: 'nash-equilibrium',
      locator: { kind: 'none' },
      answer: { kind: 'cell-set', correct: nash },
      misconceptions: [],
      explanation: `Both matched outcomes are equilibria: at either, switching alone only causes a mismatch and drops your payoff from ${m} to ${k}. With no way to communicate, players must rely on a focal point to land on the same one.`,
    },
    {
      id: 'purecoord-pareto-optimal',
      gameId: GAME_ID,
      type: 'pareto-comparison',
      prompt: 'Select all Pareto-optimal cells.',
      concept: 'nash-vs-pareto',
      locator: { kind: 'none' },
      answer: { kind: 'cell-set', correct: pareto },
      misconceptions: [],
      explanation:
        'Unlike Stag Hunt or Ranked Coordination, the two equilibria here are payoff-identical — both are Pareto optimal, and neither Pareto-dominates the other. The only problem is coordinating on which one.',
    },
  ]

  return { game, questions }
}
