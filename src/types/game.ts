export type ConceptTag =
  | 'dominant-strategy'
  | 'weak-vs-strict-dominance'
  | 'nash-equilibrium'
  | 'nash-vs-pareto'
  | 'backward-induction'
  | 'off-path-beliefs'
  | 'bayesian-best-response'
  | 'level-k-reasoning'
  | 'focal-points'

/** Two-player simultaneous-move game. Payoffs keyed by `${rowStrategy}|${colStrategy}`. */
export interface NormalFormGame {
  kind: 'normal-form'
  players: [string, string]
  strategies: Record<string, string[]>
  payoffs: Record<string, [number, number]>
}

export interface ExtensiveFormNode {
  id: string
  type: 'decision' | 'chance' | 'terminal'
  /** Required for decision nodes; the player who moves here. */
  player?: string
  /** Nodes sharing an informationSet id are indistinguishable to the moving player. */
  informationSet?: string
  /** Required for decision/chance nodes. */
  actions?: { label: string; targetNodeId: string; probability?: number }[]
  /** Required for terminal nodes, keyed by player name. */
  payoffs?: Record<string, number>
}

/** Sequential/dynamic game. Nodes are a flat map so any node is addressable by id from a QuestionLocator. */
export interface ExtensiveFormGame {
  kind: 'extensive-form'
  players: string[]
  rootId: string
  nodes: Record<string, ExtensiveFormNode>
}

/** Games with no matrix/tree representation to quiz cell-by-cell or node-by-node
 * (e.g. Beauty Contest, Divide the Cities) — narrative + parameters only. */
export interface ScenarioGame {
  kind: 'scenario'
  players: string[]
  setupText: string
  parameters?: Record<string, number | string>
}

export type GameRepresentation = NormalFormGame | ExtensiveFormGame | ScenarioGame

export interface GameDefinition {
  id: string
  title: string
  shortDescription: string
  concepts: ConceptTag[]
  representation: GameRepresentation
}
