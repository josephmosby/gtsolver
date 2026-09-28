import styles from './StrategyChoiceInput.module.css'

interface ActionChoiceInputProps {
  actions: string[]
  value: string | undefined
  onChange: (value: string) => void
  disabled?: boolean
}

export function ActionChoiceInput({ actions, value, onChange, disabled }: ActionChoiceInputProps) {
  return (
    <div className={styles.options} role="radiogroup">
      {actions.map((action) => (
        <button
          key={action}
          type="button"
          role="radio"
          aria-checked={value === action}
          disabled={disabled}
          className={[styles.option, value === action && styles.selected].filter(Boolean).join(' ')}
          onClick={() => onChange(action)}
        >
          {action}
        </button>
      ))}
    </div>
  )
}
