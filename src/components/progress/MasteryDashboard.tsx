import styles from './MasteryDashboard.module.css'
import { CONCEPT_LABELS } from '../../data/concepts'
import type { ConceptTag } from '../../types/game'
import type { ConceptProgress, ProgressStateV1 } from '../../types/progress'

export function MasteryDashboard({ progress }: { progress: ProgressStateV1 }) {
  const attempted = (Object.entries(progress.perConcept) as [ConceptTag, ConceptProgress | undefined][]).filter(
    (entry): entry is [ConceptTag, ConceptProgress] => entry[1] !== undefined && entry[1].attempts > 0,
  )

  if (attempted.length === 0) {
    return <p className={styles.empty}>Answer some questions to start tracking your mastery.</p>
  }

  return (
    <div className={styles.dashboard}>
      {attempted.map(([concept, conceptProgress]) => {
        const pct = Math.round((conceptProgress.correct / conceptProgress.attempts) * 100)
        return (
          <div key={concept} className={styles.row}>
            <span className={styles.label}>{CONCEPT_LABELS[concept]}</span>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: `${pct}%` }} />
            </div>
            <span className={styles.pct}>
              {pct}% ({conceptProgress.correct}/{conceptProgress.attempts})
            </span>
          </div>
        )
      })}
    </div>
  )
}
