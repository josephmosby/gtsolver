import styles from './MultipleChoiceInput.module.css'

interface MultipleChoiceInputProps {
  options: string[]
  value: number | undefined
  onChange: (index: number) => void
  disabled?: boolean
}

export function MultipleChoiceInput({ options, value, onChange, disabled }: MultipleChoiceInputProps) {
  return (
    <div className={styles.options} role="radiogroup">
      {options.map((option, index) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === index}
          disabled={disabled}
          className={[styles.option, value === index && styles.selected].filter(Boolean).join(' ')}
          onClick={() => onChange(index)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
