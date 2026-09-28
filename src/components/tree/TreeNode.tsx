import styles from './TreeNode.module.css'
import type { ExtensiveFormNode } from '../../types/game'

interface TreeNodeProps {
  x: number
  y: number
  node: ExtensiveFormNode
  players: string[]
  highlighted?: boolean
}

export function TreeNode({ x, y, node, players, highlighted }: TreeNodeProps) {
  if (node.type === 'terminal') {
    const payoffText = players.map((p) => node.payoffs?.[p] ?? 0).join(', ')
    return (
      <text x={x} y={y + 4} textAnchor="middle" className={styles.payoffLabel}>
        {payoffText}
      </text>
    )
  }

  return (
    <g>
      <circle cx={x} cy={y} r={16} className={[styles.node, highlighted && styles.highlighted].filter(Boolean).join(' ')} />
      <text x={x} y={y - 24} textAnchor="middle" className={styles.playerCaption}>
        {node.player}
      </text>
    </g>
  )
}
