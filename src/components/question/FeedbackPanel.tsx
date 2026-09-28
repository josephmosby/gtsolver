import styles from './FeedbackPanel.module.css'
import type { CheckResult } from '../../types/question'

export function FeedbackPanel({ result }: { result: CheckResult }) {
  return (
    <div className={[styles.panel, result.correct ? styles.correct : styles.incorrect].join(' ')}>
      <p className={styles.verdict}>{result.correct ? 'Correct' : 'Not quite'}</p>
      <p className={styles.feedback}>{result.feedback}</p>
    </div>
  )
}
