import type { ExtensiveFormGame, NormalFormGame } from '../types/game'
import type { MatrixCell } from '../types/question'

export function payoffKey(row: string, col: string): string {
  return `${row}|${col}`
}

export function getPayoff(game: NormalFormGame, row: string, col: string): [number, number] {
  const payoff = game.payoffs[payoffKey(row, col)]
  if (!payoff) throw new Error(`No payoff defined for cell (${row}, ${col})`)
  return payoff
}

/** Row player's best response(s) to a fixed column-player strategy. */
export function rowBestResponses(game: NormalFormGame, col: string): string[] {
  const rowStrategies = game.strategies[game.players[0]]
  let best = -Infinity
  let bestStrategies: string[] = []
  for (const row of rowStrategies) {
    const [rowPayoff] = getPayoff(game, row, col)
    if (rowPayoff > best) {
      best = rowPayoff
      bestStrategies = [row]
    } else if (rowPayoff === best) {
      bestStrategies.push(row)
    }
  }
  return bestStrategies
}

/** Column player's best response(s) to a fixed row-player strategy. */
export function colBestResponses(game: NormalFormGame, row: string): string[] {
  const colStrategies = game.strategies[game.players[1]]
  let best = -Infinity
  let bestStrategies: string[] = []
  for (const col of colStrategies) {
    const [, colPayoff] = getPayoff(game, row, col)
    if (colPayoff > best) {
      best = colPayoff
      bestStrategies = [col]
    } else if (colPayoff === best) {
      bestStrategies.push(col)
    }
  }
  return bestStrategies
}

/** All pure-strategy Nash equilibria: cells where both strategies are mutual best responses. */
export function computeNashEquilibria(game: NormalFormGame): MatrixCell[] {
  const [rowPlayer, colPlayer] = game.players
  const equilibria: MatrixCell[] = []
  for (const row of game.strategies[rowPlayer]) {
    for (const col of game.strategies[colPlayer]) {
      if (rowBestResponses(game, col).includes(row) && colBestResponses(game, row).includes(col)) {
        equilibria.push({ row, col })
      }
    }
  }
  return equilibria
}

/** Strictly dominant strategy for one player (index 0 = row, 1 = col), or null if none exists. */
export function computeDominantStrategy(game: NormalFormGame, playerIndex: 0 | 1): string | null {
  const [rowPlayer, colPlayer] = game.players
  const playerStrategies = playerIndex === 0 ? game.strategies[rowPlayer] : game.strategies[colPlayer]
  const opponentStrategies = playerIndex === 0 ? game.strategies[colPlayer] : game.strategies[rowPlayer]

  for (const candidate of playerStrategies) {
    const dominatesAll = playerStrategies.every((other) => {
      if (other === candidate) return true
      return opponentStrategies.every((opp) => {
        const [candidatePayoff, otherPayoff] =
          playerIndex === 0
            ? [getPayoff(game, candidate, opp)[0], getPayoff(game, other, opp)[0]]
            : [getPayoff(game, opp, candidate)[1], getPayoff(game, opp, other)[1]]
        return candidatePayoff > otherPayoff
      })
    })
    if (dominatesAll) return candidate
  }
  return null
}

export function computeDominantStrategies(game: NormalFormGame): { row: string | null; col: string | null } {
  return { row: computeDominantStrategy(game, 0), col: computeDominantStrategy(game, 1) }
}

/** A cell is Pareto optimal if no other cell weakly improves both payoffs and strictly improves one. */
export function isParetoOptimal(game: NormalFormGame, cell: MatrixCell): boolean {
  const [rowPlayer, colPlayer] = game.players
  const [baseRow, baseCol] = getPayoff(game, cell.row, cell.col)
  for (const row of game.strategies[rowPlayer]) {
    for (const col of game.strategies[colPlayer]) {
      if (row === cell.row && col === cell.col) continue
      const [r, c] = getPayoff(game, row, col)
      if (r >= baseRow && c >= baseCol && (r > baseRow || c > baseCol)) return false
    }
  }
  return true
}

export function allParetoOptimalCells(game: NormalFormGame): MatrixCell[] {
  const [rowPlayer, colPlayer] = game.players
  const cells: MatrixCell[] = []
  for (const row of game.strategies[rowPlayer]) {
    for (const col of game.strategies[colPlayer]) {
      if (isParetoOptimal(game, { row, col })) cells.push({ row, col })
    }
  }
  return cells
}

export interface BackwardInductionResult {
  /** The optimal action label at this node, or null for terminal/chance nodes. */
  action: string | null
  payoffs: Record<string, number>
}

/**
 * Solves an extensive-form game by backward induction, assuming perfect information
 * at every decision node (each node is its own singleton information set). Games with
 * genuine imperfect-information subgames should author belief-based questions
 * directly rather than relying on this for those nodes.
 */
export function backwardInduction(game: ExtensiveFormGame): Record<string, BackwardInductionResult> {
  const results: Record<string, BackwardInductionResult> = {}

  function solve(nodeId: string): Record<string, number> {
    const node = game.nodes[nodeId]
    if (!node) throw new Error(`Unknown node ${nodeId}`)

    if (node.type === 'terminal') {
      if (!node.payoffs) throw new Error(`Terminal node ${nodeId} is missing payoffs`)
      results[nodeId] = { action: null, payoffs: node.payoffs }
      return node.payoffs
    }

    if (!node.actions || node.actions.length === 0) {
      throw new Error(`Non-terminal node ${nodeId} has no actions`)
    }

    if (node.type === 'chance') {
      const expected: Record<string, number> = {}
      for (const action of node.actions) {
        const childPayoffs = solve(action.targetNodeId)
        const p = action.probability ?? 1 / node.actions.length
        for (const player of Object.keys(childPayoffs)) {
          expected[player] = (expected[player] ?? 0) + p * childPayoffs[player]
        }
      }
      results[nodeId] = { action: null, payoffs: expected }
      return expected
    }

    // decision node: mover picks the action maximizing their own payoff
    if (!node.player) throw new Error(`Decision node ${nodeId} is missing a player`)
    const mover = node.player
    let bestAction: string | null = null
    let bestPayoffs: Record<string, number> | null = null
    for (const action of node.actions) {
      const childPayoffs = solve(action.targetNodeId)
      if (bestPayoffs === null || childPayoffs[mover] > bestPayoffs[mover]) {
        bestAction = action.label
        bestPayoffs = childPayoffs
      }
    }
    results[nodeId] = { action: bestAction, payoffs: bestPayoffs! }
    return bestPayoffs!
  }

  solve(game.rootId)
  return results
}

export interface TreeLayoutNode {
  id: string
  x: number
  y: number
}

/** Simple tidy-tree layout: y = depth from root, x = average of children's x (leaves get sequential x). */
export function layoutTree(game: ExtensiveFormGame): Record<string, TreeLayoutNode> {
  const layout: Record<string, TreeLayoutNode> = {}
  let nextLeafX = 0

  function visit(nodeId: string, depth: number): number {
    const node = game.nodes[nodeId]
    if (!node) throw new Error(`Unknown node ${nodeId}`)

    if (node.type === 'terminal' || !node.actions || node.actions.length === 0) {
      const x = nextLeafX++
      layout[nodeId] = { id: nodeId, x, y: depth }
      return x
    }

    const childXs = node.actions.map((action) => visit(action.targetNodeId, depth + 1))
    const x = childXs.reduce((sum, v) => sum + v, 0) / childXs.length
    layout[nodeId] = { id: nodeId, x, y: depth }
    return x
  }

  visit(game.rootId, 0)
  return layout
}
