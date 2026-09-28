import styles from './NumericInput.module.css'

interface NumericInputProps {
  value: number | undefined
  onChange: (value: number) => void
  disabled?: boolean
  min?: number
  max?: number
}

export function NumericInput({ value, onChange, disabled, min, max }: NumericInputProps) {
  return (
    <div className={styles.wrapper}>
      <input
        type="number"
        className={styles.input}
        value={value ?? ''}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => {
          const parsed = Number(e.target.value)
          if (e.target.value !== '' && !Number.isNaN(parsed)) onChange(parsed)
        }}
      />
    </div>
  )
}
