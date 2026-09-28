import styles from './ExtensiveFormTree.module.css'
import { TreeNode } from './TreeNode'
import { layoutTree } from '../../engine/gameUtils'
import type { ExtensiveFormGame } from '../../types/game'

interface ExtensiveFormTreeProps {
  game: ExtensiveFormGame
  highlightNodeId?: string
}

const X_SPACING = 130
const Y_SPACING = 100
const MARGIN_X = 50
const MARGIN_Y = 40

export function ExtensiveFormTree({ game, highlightNodeId }: ExtensiveFormTreeProps) {
  const layout = layoutTree(game)
  const nodeIds = Object.keys(game.nodes)
  const positions = Object.fromEntries(
    nodeIds.map((id) => [id, { x: MARGIN_X + layout[id].x * X_SPACING, y: MARGIN_Y + layout[id].y * Y_SPACING }]),
  )
  const maxX = Math.max(...nodeIds.map((id) => layout[id].x))
  const maxY = Math.max(...nodeIds.map((id) => layout[id].y))
  const width = MARGIN_X * 2 + maxX * X_SPACING + 20
  const height = MARGIN_Y * 2 + maxY * Y_SPACING + 20

  const infoSetGroups = new Map<string, string[]>()
  for (const id of nodeIds) {
    const infoSet = game.nodes[id].informationSet
    if (!infoSet) continue
    infoSetGroups.set(infoSet, [...(infoSetGroups.get(infoSet) ?? []), id])
  }

  return (
    <div className={styles.wrapper}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {nodeIds.flatMap((id) => {
          const node = game.nodes[id]
          if (!node.actions) return []
          const from = positions[id]
          return node.actions.map((action) => {
            const to = positions[action.targetNodeId]
            const midX = (from.x + to.x) / 2
            const midY = (from.y + to.y) / 2
            return (
              <g key={`${id}-${action.targetNodeId}`}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={styles.edge} />
                <text x={midX} y={midY - 6} textAnchor="middle" className={styles.actionLabel}>
                  {action.label}
                </text>
              </g>
            )
          })
        })}

        {[...infoSetGroups.values()]
          .filter((ids) => ids.length > 1)
          .flatMap((ids) =>
            ids.slice(1).map((id, i) => {
              const a = positions[ids[i]]
              const b = positions[id]
              return <line key={`infoset-${ids[i]}-${id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={styles.infoSetLink} />
            }),
          )}

        {nodeIds.map((id) => (
          <TreeNode
            key={id}
            x={positions[id].x}
            y={positions[id].y}
            node={game.nodes[id]}
            players={game.players}
            highlighted={id === highlightNodeId}
          />
        ))}
      </svg>
    </div>
  )
}
