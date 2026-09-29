import { computeDominantStrategy, computeNashEquilibria, allParetoOptimalCells } from '../../engine/gameUtils'
import { randInt } from '../../engine/random'
import type { RNG } from '../../engine/random'
import type { GameDefinition, NormalFormGame } from '../../types/game'
import type { Question } from '../../types/question'

const GAME_ID = 'prisoners-dilemma'
const [ROW, COL] = ['Row', 'Col']
const [SILENT, BETRAY] = ['Stay Silent', 'Betray']

/**
 * Generates payoffs satisfying the canonical Prisoner's Dilemma constraints
 * (T > R > P > S, and 2R > T + S so mutual cooperation Pareto-dominates alternating
 * betrayal) — this guarantees Betray strictly dominates and (Betray, Betray) is the
 * unique Nash equilibrium no matter which specific numbers are drawn.
 */
function generatePayoffs(rng: RNG) {
  const P = randInt(rng, 1, 3)
  const S = randInt(rng, 0, P - 1)
  const R = randInt(rng, P + 1, P + 4)
  const T = randInt(rng, R + 1, 2 * R - S - 1)
  return { P, S, R, T }
}

export function generateInstance(rng: RNG = Math.random): { game: GameDefinition; questions: Question[] } {
  const { P, S, R, T } = generatePayoffs(rng)

  const representation: NormalFormGame = {
    kind: 'normal-form',
    players: [ROW, COL],
    strategies: { [ROW]: [SILENT, BETRAY], [COL]: [SILENT, BETRAY] },
    payoffs: {
      [`${SILENT}|${SILENT}`]: [R, R],
      [`${SILENT}|${BETRAY}`]: [S, T],
      [`${BETRAY}|${SILENT}`]: [T, S],
      [`${BETRAY}|${BETRAY}`]: [P, P],
    },
  }

  const game: GameDefinition = {
    id: GAME_ID,
    title: "Prisoner's Dilemma",
    shortDescription:
      'Two suspects are interrogated separately. Each is individually better off betraying the other, even though mutual silence would leave them both better off.',
    concepts: ['dominant-strategy', 'nash-equilibrium', 'nash-vs-pareto'],
    representation,
  }

  const dominant = computeDominantStrategy(representation, 0) ?? BETRAY
  const nash = computeNashEquilibria(representation)
  const pareto = allParetoOptimalCells(representation)

  const questions: Question[] = [
    {
      id: 'pd-best-response-col-silent',
      gameId: GAME_ID,
      type: 'best-response',
      prompt: "If Column stays silent, what is Row's best response?",
      concept: 'dominant-strategy',
      locator: { kind: 'col', col: SILENT },
      subjectPlayer: ROW,
      answer: { kind: 'strategy', correct: BETRAY },
      misconceptions: [],
      explanation: `Betraying gives Row ${T} instead of ${R} if Column stays silent, so it beats staying silent here.`,
    },
    {
      id: 'pd-best-response-col-betray',
      gameId: GAME_ID,
      type: 'best-response',
      prompt: "If Column betrays, what is Row's best response?",
      concept: 'dominant-strategy',
      locator: { kind: 'col', col: BETRAY },
      subjectPlayer: ROW,
      answer: { kind: 'strategy', correct: BETRAY },
      misconceptions: [],
      explanation: `Betraying gives Row ${P} instead of ${S} if Column also betrays, so it still beats staying silent.`,
    },
    {
      id: 'pd-dominant-strategy-row',
      gameId: GAME_ID,
      type: 'dominant-strategy',
      prompt: 'Does Row have a dominant strategy? If so, which one?',
      concept: 'dominant-strategy',
      locator: { kind: 'none' },
      subjectPlayer: ROW,
      answer: { kind: 'strategy-or-none', correct: dominant },
      misconceptions: [],
      explanation: `Betray strictly beats Stay Silent against both of Column's strategies (${T}>${R} and ${P}>${S}), so it strictly dominates — Row should betray no matter what Column does.`,
    },
    {
      id: 'pd-nash-equilibrium',
      gameId: GAME_ID,
      type: 'nash-equilibrium-cell',
      prompt: 'Select all pure-strategy Nash equilibria.',
      concept: 'nash-equilibrium',
      locator: { kind: 'none' },
      answer: { kind: 'cell-set', correct: nash },
      misconceptions: [],
      explanation: `(Betray, Betray) is the only cell where neither player can gain by unilaterally switching strategies — from there, switching to Stay Silent drops your own payoff from ${P} to ${S}.`,
    },
    {
      id: 'pd-pareto-optimal',
      gameId: GAME_ID,
      type: 'pareto-comparison',
      prompt: 'Select all Pareto-optimal cells (no other cell makes both players at least as well off, and one strictly better).',
      concept: 'nash-vs-pareto',
      locator: { kind: 'none' },
      answer: { kind: 'cell-set', correct: pareto },
      misconceptions: [],
      explanation: `Mutual betrayal (${P},${P}) is Pareto-dominated by mutual silence (${R},${R}) — both players do better there. The other three cells are all Pareto optimal: none of them can be improved for both players simultaneously. This is the heart of the dilemma: the unique Nash equilibrium (Betray, Betray) is the one Pareto-inefficient outcome.`,
    },
  ]

  return { game, questions }
}
