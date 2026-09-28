import { GameList } from '../components/games/GameList'
import { games } from '../data/games/index'

export function HomePage() {
  return (
    <div>
      <h1>gtsolver</h1>
      <p>Pick a game to start quizzing yourself.</p>
      <GameList games={games} />
    </div>
  )
}
