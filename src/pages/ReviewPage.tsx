import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './ReviewPage.module.css'
import { QuestionRunner } from '../components/question/QuestionRunner'
import { gameGenerators } from '../data/games/index'
import { pickWeightedReviewQuestions } from '../engine/selectors'
import { useProgress } from '../persistence/progressStore'
import type { GameDefinition } from '../types/game'
import type { CheckResult, Question } from '../types/question'

const REVIEW_SESSION_SIZE = 10

function buildReviewPool() {
  const instances = Object.values(gameGenerators).map((generate) => generate())
  const allQuestions: Question[] = instances.flatMap((i) => i.questions)
  const gamesById: Record<string, GameDefinition> = Object.fromEntries(instances.map((i) => [i.game.id, i.game]))
  return { allQuestions, gamesById }
}

export function ReviewPage() {
  const { state } = useProgress()
  // Generates one fresh instance per game and snapshots the picked set once per visit,
  // so it doesn't reshuffle (or swap out the live payoffs) as attempts are recorded mid-session.
  const [{ questions, gamesById }] = useState(() => {
    const pool = buildReviewPool()
    return { questions: pickWeightedReviewQuestions(pool.allQuestions, state, REVIEW_SESSION_SIZE), gamesById: pool.gamesById }
  })
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
        <h1>Review complete</h1>
        <p className={styles.score}>
          {correctCount} / {questions.length} correct
        </p>
        <Link className={styles.homeLink} to="/">
          All games
        </Link>
      </div>
    )
  }

  const question = questions[index]
  const game = gamesById[question.gameId]

  return (
    <div>
      <div className={styles.header}>
        <h2>Review</h2>
        <p className={styles.progress}>
          Question {index + 1} of {questions.length} · {correctCount}/{answeredCount} correct so far · from {game.title}
        </p>
      </div>
      <QuestionRunner key={question.id} question={question} game={game} onAnswered={handleAnswered} onNext={() => setIndex((i) => i + 1)} />
    </div>
  )
}
