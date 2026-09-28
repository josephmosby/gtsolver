import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'
import { GameList } from '../components/games/GameList'
import { MasteryDashboard } from '../components/progress/MasteryDashboard'
import { MistakeHistoryList } from '../components/progress/MistakeHistoryList'
import { games } from '../data/games/index'
import { useProgress } from '../persistence/progressStore'

export function HomePage() {
  const { state } = useProgress()

  return (
    <div>
      <h1>gtsolver</h1>
      <p>
        Pick a game to start quizzing yourself, or <Link to="/review">jump into a review session</Link> mixed across
        everything you've played.
      </p>
      <GameList games={games} />

      <h2 className={styles.section}>Mastery by Concept</h2>
      <MasteryDashboard progress={state} />

      <h2 className={styles.section}>Recent Mistakes</h2>
      <MistakeHistoryList progress={state} />
    </div>
  )
}
