import { allParetoOptimalCells, computeNashEquilibria } from '../gameUtils'
import { cellKey } from '../matrixCell'
import type { Diagnostic } from './types'

/** Catches selecting a Pareto-optimal cell while missing the actual Nash equilibrium/equilibria. */
export const nashVsPareto: Diagnostic = {
  id: 'nash-vs-pareto',
  feedback:
    "That cell is Pareto optimal (jointly best for both players) but that doesn't make it a Nash equilibrium. Check whether either player could do better by unilaterally switching strategies given the other player's choice.",
  matches: ({ game, question, submitted }) => {
    if (question.type !== 'nash-equilibrium-cell') return false
    if (submitted.kind !== 'cell-set') return false
    if (game.representation.kind !== 'normal-form') return false
    const nf = game.representation
    const nash = computeNashEquilibria(nf)
    const pareto = allParetoOptimalCells(nf)
    const nashKeys = new Set(nash.map(cellKey))
    const paretoKeys = new Set(pareto.map(cellKey))
    const submittedKeys = submitted.value.map(cellKey)
    const selectedNonNashPareto = submittedKeys.some((k) => paretoKeys.has(k) && !nashKeys.has(k))
    const missedActualNash = nash.some((n) => !submittedKeys.includes(cellKey(n)))
    return selectedNonNashPareto && missedActualNash
  },
}
