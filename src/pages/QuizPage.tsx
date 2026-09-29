import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import styles from './QuizPage.module.css'
import { QuestionRunner } from '../components/question/QuestionRunner'
import { gameGenerators } from '../data/games/index'
import type { GameModule } from '../data/games/index'
import type { RNG } from '../engine/random'
import type { CheckResult } from '../types/question'

export function QuizPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const generator = gameId ? gameGenerators[gameId] : undefined

  if (!generator) {
    return (
      <div>
        <p>Quiz not found.</p>
        <Link to="/">Back home</Link>
      </div>
    )
  }

  // Keyed by gameId so switching quizzes (e.g. via a direct link) fully resets progress
  // through this quiz, instead of reusing stale index/score state from the previous game —
  // and generates a fresh randomized instance for this attempt.
  return <QuizSession key={gameId} generator={generator} />
}

function QuizSession({ generator }: { generator: (rng?: RNG) => GameModule }) {
  const [{ game, questions }] = useState(() => generator())
  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)

  function handleAnswered(result: CheckResult) {
    setAnsweredCount((c) => c + 1)
    if (result.correct) setCorrectCount((c) => c + 1)
  }

  if (index >= questions.length) {
    return (
      <div className={styles.summary}>
        <h1>Quiz complete</h1>
        <p className={styles.score}>
          {correctCount} / {questions.length} correct
        </p>
        <Link className={styles.homeLink} to={`/game/${game.id}`}>
          Back to {game.title}
        </Link>
        <Link className={styles.homeLink} to="/">
          All games
        </Link>
      </div>
    )
  }

  const question = questions[index]

  return (
    <div>
      <div className={styles.header}>
        <h2>{game.title}</h2>
        <p className={styles.progress}>
          Question {index + 1} of {questions.length} · {correctCount}/{answeredCount} correct so far
        </p>
      </div>
      <QuestionRunner key={question.id} question={question} game={game} onAnswered={handleAnswered} onNext={() => setIndex((i) => i + 1)} />
    </div>
  )
}
