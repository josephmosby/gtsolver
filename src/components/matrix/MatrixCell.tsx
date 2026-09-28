import styles from './MatrixCell.module.css'

interface MatrixCellProps {
  payoff: [number, number]
  rowLabel: string
  colLabel: string
  highlighted?: boolean
  selectable?: boolean
  selected?: boolean
  onClick?: () => void
}

export function MatrixCell({ payoff, rowLabel, colLabel, highlighted, selectable, selected, onClick }: MatrixCellProps) {
  const [rowPayoff, colPayoff] = payoff
  const classes = [styles.cell, highlighted && styles.highlighted, selectable && styles.selectable, selected && styles.selected]
    .filter(Boolean)
    .join(' ')

  return (
    <td
      className={classes}
      role={selectable ? 'button' : undefined}
      tabIndex={selectable ? 0 : undefined}
      aria-pressed={selectable ? selected : undefined}
      aria-label={`${rowLabel}, ${colLabel}: payoff ${rowPayoff}, ${colPayoff}`}
      onClick={selectable ? onClick : undefined}
      onKeyDown={
        selectable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
    >
      {rowPayoff}
      <span className={styles.separator}>,</span>
      {colPayoff}
    </td>
  )
}
