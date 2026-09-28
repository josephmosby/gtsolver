import { Link } from 'react-router-dom'
import styles from './GameList.module.css'
import type { GameDefinition } from '../../types/game'

export function GameList({ games }: { games: GameDefinition[] }) {
  return (
    <div className={styles.list}>
      {games.map((game) => (
        <Link key={game.id} to={`/game/${game.id}`} className={styles.card}>
          <h3>{game.title}</h3>
          <p>{game.shortDescription}</p>
        </Link>
      ))}
    </div>
  )
}
