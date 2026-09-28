import { Link } from 'react-router-dom'
import styles from './GameIntro.module.css'
import { CONCEPT_LABELS } from '../../data/concepts'
import { MatrixGameBoard } from '../matrix/MatrixGameBoard'
import type { GameDefinition } from '../../types/game'

export function GameIntro({ game }: { game: GameDefinition }) {
  return (
    <div className={styles.intro}>
      <h1>{game.title}</h1>
      <p className={styles.description}>{game.shortDescription}</p>
      <div className={styles.concepts}>
        {game.concepts.map((concept) => (
          <span key={concept} className={styles.tag}>
            {CONCEPT_LABELS[concept]}
          </span>
        ))}
      </div>
      {game.representation.kind === 'normal-form' && <MatrixGameBoard game={game.representation} />}
      <Link to={`/quiz/${game.id}`} className={styles.startButton}>
        Start Quiz
      </Link>
    </div>
  )
}
