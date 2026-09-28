import { MatrixCell } from './MatrixCell'
import styles from './MatrixGameBoard.module.css'
import { getPayoff } from '../../engine/gameUtils'
import { cellKey } from '../../engine/matrixCell'
import type { NormalFormGame } from '../../types/game'
import type { MatrixCell as MatrixCellType } from '../../types/question'

interface MatrixGameBoardProps {
  game: NormalFormGame
  highlightRow?: string
  highlightCol?: string
  selectable?: boolean
  selectedCells?: MatrixCellType[]
  onToggleCell?: (cell: MatrixCellType) => void
}

export function MatrixGameBoard({
  game,
  highlightRow,
  highlightCol,
  selectable,
  selectedCells,
  onToggleCell,
}: MatrixGameBoardProps) {
  const [rowPlayer, colPlayer] = game.players
  const rowStrategies = game.strategies[rowPlayer]
  const colStrategies = game.strategies[colPlayer]
  const selectedKeys = new Set((selectedCells ?? []).map(cellKey))

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th rowSpan={2} colSpan={2} className={styles.cornerCell} />
            <th colSpan={colStrategies.length} className={styles.colPlayerLabel}>
              {colPlayer}
            </th>
          </tr>
          <tr>
            {colStrategies.map((col) => (
              <th
                key={col}
                className={[styles.strategyHeader, col === highlightCol && styles.highlighted].filter(Boolean).join(' ')}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowStrategies.map((row, i) => (
            <tr key={row}>
              {i === 0 && (
                <th rowSpan={rowStrategies.length} className={styles.rowPlayerLabel}>
                  {rowPlayer}
                </th>
              )}
              <th className={[styles.strategyHeader, row === highlightRow && styles.highlighted].filter(Boolean).join(' ')}>
                {row}
              </th>
              {colStrategies.map((col) => (
                <MatrixCell
                  key={col}
                  payoff={getPayoff(game, row, col)}
                  rowLabel={row}
                  colLabel={col}
                  highlighted={row === highlightRow || col === highlightCol}
                  selectable={selectable}
                  selected={selectedKeys.has(cellKey({ row, col }))}
                  onClick={() => onToggleCell?.({ row, col })}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
