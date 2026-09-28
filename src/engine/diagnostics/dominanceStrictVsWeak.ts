import { getPayoff } from '../gameUtils'
import type { NormalFormGame } from '../../types/game'
import type { Diagnostic } from './types'

function isWeaklyDominant(game: NormalFormGame, playerIndex: 0 | 1, candidate: string): boolean {
  const [rowPlayer, colPlayer] = game.players
  const playerStrategies = playerIndex === 0 ? game.strategies[rowPlayer] : game.strategies[colPlayer]
  const opponentStrategies = playerIndex === 0 ? game.strategies[colPlayer] : game.strategies[rowPlayer]
  return playerStrategies.every((other) => {
    if (other === candidate) return true
    let weaklyBetterEverywhere = true
    let strictlyBetterSomewhere = false
    for (const opp of opponentStrategies) {
      const [candidatePayoff, otherPayoff] =
        playerIndex === 0
          ? [getPayoff(game, candidate, opp)[0], getPayoff(game, other, opp)[0]]
          : [getPayoff(game, opp, candidate)[1], getPayoff(game, opp, other)[1]]
      if (candidatePayoff < otherPayoff) weaklyBetterEverywhere = false
      if (candidatePayoff > otherPayoff) strictlyBetterSomewhere = true
    }
    return weaklyBetterEverywhere && strictlyBetterSomewhere
  })
}

/** Catches calling a strategy "dominant" when it only weakly (not strictly) dominates every alternative. */
export const dominanceStrictVsWeak: Diagnostic = {
  id: 'dominance-strict-vs-weak',
  feedback:
    'That strategy is at least as good as every alternative, but not strictly better against every possible opponent strategy — so it weakly dominates, not strictly dominates. A dominant strategy has to strictly beat every alternative no matter what the opponent does.',
  matches: ({ game, question, submitted }) => {
    if (question.type !== 'dominant-strategy') return false
    if (submitted.kind !== 'strategy-or-none' || submitted.value === null) return false
    if (question.answer.kind !== 'strategy-or-none' || question.answer.correct !== null) return false
    if (!question.subjectPlayer) return false
    if (game.representation.kind !== 'normal-form') return false
    const nf = game.representation
    const playerIndex: 0 | 1 = nf.players[0] === question.subjectPlayer ? 0 : 1
    return isWeaklyDominant(nf, playerIndex, submitted.value)
  },
}
