import styles from './MistakeHistoryList.module.css'
import { allQuestions } from '../../data/games/index'
import type { ProgressStateV1 } from '../../types/progress'

const questionsById = Object.fromEntries(allQuestions.map((q) => [q.id, q]))

export function MistakeHistoryList({ progress, limit = 10 }: { progress: ProgressStateV1; limit?: number }) {
  const mistakes = progress.attemptLog.filter((entry) => !entry.correct).slice(0, limit)

  if (mistakes.length === 0) {
    return <p className={styles.empty}>No mistakes logged yet.</p>
  }

  return (
    <ul className={styles.list}>
      {mistakes.map((entry, i) => {
        const question = questionsById[entry.questionId]
        return (
          <li key={`${entry.questionId}-${entry.timestamp}-${i}`} className={styles.item}>
            <span className={styles.prompt}>{question?.prompt ?? entry.questionId}</span>
            <span className={styles.meta}>{new Date(entry.timestamp).toLocaleString()}</span>
          </li>
        )
      })}
    </ul>
  )
}
