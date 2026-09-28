import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import styles from './QuizPage.module.css'
import { QuestionRunner } from '../components/question/QuestionRunner'
import { gamesById, questionsByGameId } from '../data/games/index'
import type { GameDefinition } from '../types/game'
import type { CheckResult, Question } from '../types/question'

export function QuizPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const game = gameId ? gamesById[gameId] : undefined
  const questions = gameId ? questionsByGameId[gameId] : undefined

  if (!game || !questions) {
    return (
      <div>
        <p>Quiz not found.</p>
        <Link to="/">Back home</Link>
      </div>
    )
  }

  // Keyed by gameId so switching quizzes (e.g. via a direct link) fully resets progress
  // through this quiz, instead of reusing stale index/score state from the previous game.
  return <QuizSession key={game.id} game={game} questions={questions} />
}

function QuizSession({ game, questions }: { game: GameDefinition; questions: Question[] }) {
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
