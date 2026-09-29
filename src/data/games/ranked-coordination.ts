import { computeDominantStrategy, computeNashEquilibria, allParetoOptimalCells } from '../../engine/gameUtils'
import { randInt } from '../../engine/random'
import type { RNG } from '../../engine/random'
import type { GameDefinition, NormalFormGame } from '../../types/game'
import type { Question } from '../../types/question'

const GAME_ID = 'ranked-coordination'
const [ROW, COL] = ['Row', 'Col']
const [NEW_STANDARD, OLD_STANDARD] = ['New Standard', 'Old Standard']

/** k < m_lo < m_hi so the equilibria are ranked (High/High payoff-dominates Low/Low),
 * unlike Pure Coordination where the two equilibria tie. */
function generatePayoffs(rng: RNG) {
  const mLo = randInt(rng, 1, 3)
  const mHi = randInt(rng, mLo + 1, mLo + 5)
  const k = randInt(rng, 0, mLo - 1)
  return { mLo, mHi, k }
}

export function generateInstance(rng: RNG = Math.random): { game: GameDefinition; questions: Question[] } {
  const { mLo, mHi, k } = generatePayoffs(rng)

  const representation: NormalFormGame = {
    kind: 'normal-form',
    players: [ROW, COL],
    strategies: { [ROW]: [NEW_STANDARD, OLD_STANDARD], [COL]: [NEW_STANDARD, OLD_STANDARD] },
    payoffs: {
      [`${NEW_STANDARD}|${NEW_STANDARD}`]: [mHi, mHi],
      [`${NEW_STANDARD}|${OLD_STANDARD}`]: [k, k],
      [`${OLD_STANDARD}|${NEW_STANDARD}`]: [k, k],
      [`${OLD_STANDARD}|${OLD_STANDARD}`]: [mLo, mLo],
    },
  }

  const game: GameDefinition = {
    id: GAME_ID,
    title: 'Ranked Coordination',
    shortDescription:
      'Two firms each choose which technology standard to adopt. Matching on the newer standard benefits both more than matching on the old one — but a mismatch is costly either way, so nobody wants to move first.',
    concepts: ['nash-equilibrium', 'nash-vs-pareto'],
    representation,
  }

  const dominant = computeDominantStrategy(representation, 0)
  const nash = computeNashEquilibria(representation)
  const pareto = allParetoOptimalCells(representation)

  const questions: Question[] = [
    {
      id: 'rankedcoord-best-response-col-new',
      gameId: GAME_ID,
      type: 'best-response',
      prompt: "If Column adopts the New Standard, what is Row's best response?",
      concept: 'nash-equilibrium',
      locator: { kind: 'col', col: NEW_STANDARD },
      subjectPlayer: ROW,
      answer: { kind: 'strategy', correct: NEW_STANDARD },
      misconceptions: [],
      explanation: `Matching on New Standard gives Row ${mHi}, the best payoff available anywhere in the game.`,
    },
    {
      id: 'rankedcoord-best-response-col-old',
      gameId: GAME_ID,
      type: 'best-response',
      prompt: "If Column adopts the Old Standard, what is Row's best response?",
      concept: 'nash-equilibrium',
      locator: { kind: 'col', col: OLD_STANDARD },
      subjectPlayer: ROW,
      answer: { kind: 'strategy', correct: OLD_STANDARD },
      misconceptions: [],
      explanation: `If Column is on the Old Standard, matching gives Row ${mLo}, versus ${k} for mismatching by going New.`,
    },
    {
      id: 'rankedcoord-dominant-strategy-row',
      gameId: GAME_ID,
      type: 'dominant-strategy',
      prompt: 'Does Row have a dominant strategy? If so, which one?',
      concept: 'dominant-strategy',
      locator: { kind: 'none' },
      subjectPlayer: ROW,
      answer: { kind: 'strategy-or-none', correct: dominant },
      misconceptions: [],
      explanation:
        "Row wants to match Column either way, so the best response flips depending on Column's choice — no dominant strategy, even though New Standard is the better outcome if coordination succeeds.",
    },
    {
      id: 'rankedcoord-nash-equilibrium',
      gameId: GAME_ID,
      type: 'nash-equilibrium-cell',
      prompt: 'Select all pure-strategy Nash equilibria.',
      concept: 'nash-equilibrium',
      locator: { kind: 'none' },
      answer: { kind: 'cell-set', correct: nash },
      misconceptions: [],
      explanation:
        'Both matched outcomes are equilibria — but they are not equally good. This is what separates Ranked Coordination from Pure Coordination: the equilibria are ranked by payoff.',
    },
    {
      id: 'rankedcoord-pareto-optimal',
      gameId: GAME_ID,
      type: 'pareto-comparison',
      prompt: 'Select all Pareto-optimal cells.',
      concept: 'nash-vs-pareto',
      locator: { kind: 'none' },
      answer: { kind: 'cell-set', correct: pareto },
      misconceptions: [],
      explanation:
        "Only (New Standard, New Standard) is Pareto optimal — it Pareto-dominates every other cell, including the other equilibrium (Old Standard, Old Standard). Unlike Stag Hunt, there's no off-diagonal payoff asymmetry creating a risk-dominance argument for the safer equilibrium here: Old Standard is simply worse for both players if they could coordinate on New instead.",
    },
  ]

  return { game, questions }
}
