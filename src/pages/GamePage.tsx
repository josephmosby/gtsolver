import { Link, useParams } from 'react-router-dom'
import { GameIntro } from '../components/games/GameIntro'
import { gamesById } from '../data/games/index'

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const game = gameId ? gamesById[gameId] : undefined

  if (!game) {
    return (
      <div>
        <p>Game not found.</p>
        <Link to="/">Back home</Link>
      </div>
    )
  }

  return <GameIntro game={game} />
}
