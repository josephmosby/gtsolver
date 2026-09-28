import styles from './StrategyChoiceInput.module.css'

interface StrategyChoiceInputProps {
  strategies: string[]
  allowNone?: boolean
  value: string | null | undefined
  onChange: (value: string | null) => void
  disabled?: boolean
}

export function StrategyChoiceInput({ strategies, allowNone, value, onChange, disabled }: StrategyChoiceInputProps) {
  return (
    <div className={styles.options} role="radiogroup">
      {strategies.map((strategy) => (
        <button
          key={strategy}
          type="button"
          role="radio"
          aria-checked={value === strategy}
          disabled={disabled}
          className={[styles.option, value === strategy && styles.selected].filter(Boolean).join(' ')}
          onClick={() => onChange(strategy)}
        >
          {strategy}
        </button>
      ))}
      {allowNone && (
        <button
          type="button"
          role="radio"
          aria-checked={value === null}
          disabled={disabled}
          className={[styles.option, styles.none, value === null && styles.selected].filter(Boolean).join(' ')}
          onClick={() => onChange(null)}
        >
          No dominant strategy
        </button>
      )}
    </div>
  )
}
