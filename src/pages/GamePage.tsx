import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GameIntro } from '../components/games/GameIntro'
import { gameGenerators } from '../data/games/index'
import type { GameModule } from '../data/games/index'
import type { RNG } from '../engine/random'

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const generator = gameId ? gameGenerators[gameId] : undefined

  if (!generator) {
    return (
      <div>
        <p>Game not found.</p>
        <Link to="/">Back home</Link>
      </div>
    )
  }

  // Keyed by gameId so navigating between games regenerates; a fresh instance every visit.
  return <GamePreview key={gameId} generator={generator} />
}

function GamePreview({ generator }: { generator: (rng?: RNG) => GameModule }) {
  const [{ game }] = useState(() => generator())
  return <GameIntro game={game} />
}
