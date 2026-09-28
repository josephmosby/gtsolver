import { useState } from 'react'
import { ActionChoiceInput } from './answer-inputs/ActionChoiceInput'
import { MultipleChoiceInput } from './answer-inputs/MultipleChoiceInput'
import { NumericInput } from './answer-inputs/NumericInput'
import { StrategyChoiceInput } from './answer-inputs/StrategyChoiceInput'
import { FeedbackPanel } from './FeedbackPanel'
import styles from './QuestionRunner.module.css'
import { checkAnswer } from '../../engine/checkAnswer'
import { useProgress } from '../../persistence/progressStore'
import { MatrixGameBoard } from '../matrix/MatrixGameBoard'
import { ExtensiveFormTree } from '../tree/ExtensiveFormTree'
import type { GameDefinition } from '../../types/game'
import type { CheckResult, MatrixCell, Question, Submission } from '../../types/question'

interface QuestionRunnerProps {
  question: Question
  game: GameDefinition
  onAnswered?: (result: CheckResult) => void
  onNext?: () => void
}

export function QuestionRunner({ question, game, onAnswered, onNext }: QuestionRunnerProps) {
  const { recordAttempt } = useProgress()
  const [draft, setDraft] = useState<Submission | null>(null)
  const [selectedCells, setSelectedCells] = useState<MatrixCell[]>([])
  const [result, setResult] = useState<CheckResult | null>(null)

  const isCellSet = question.answer.kind === 'cell-set'
  const submitted = result !== null

  function handleToggleCell(cell: MatrixCell) {
    if (submitted) return
    setSelectedCells((prev) => {
      const exists = prev.some((c) => c.row === cell.row && c.col === cell.col)
      return exists ? prev.filter((c) => !(c.row === cell.row && c.col === cell.col)) : [...prev, cell]
    })
  }

  function handleSubmit() {
    const submission: Submission | null = isCellSet ? { kind: 'cell-set', value: selectedCells } : draft
    if (!submission) return
    const checkResult = checkAnswer(question, game, submission)
    setResult(checkResult)
    recordAttempt({
      questionId: question.id,
      gameId: question.gameId,
      concept: question.concept,
      correct: checkResult.correct,
      misconceptionId: checkResult.misconceptionId,
    })
    onAnswered?.(checkResult)
  }

  const canSubmit = isCellSet || draft !== null

  const subjectStrategies =
    game.representation.kind === 'normal-form' && question.subjectPlayer
      ? game.representation.strategies[question.subjectPlayer]
      : []

  const nodeActions =
    game.representation.kind === 'extensive-form' && question.locator.kind === 'node'
      ? (game.representation.nodes[question.locator.nodeId].actions?.map((a) => a.label) ?? [])
      : []

  return (
    <div className={styles.runner}>
      <p className={styles.prompt}>{question.prompt}</p>

      {game.representation.kind === 'normal-form' && (
        <MatrixGameBoard
          game={game.representation}
          highlightRow={question.locator.kind === 'row' ? question.locator.row : undefined}
          highlightCol={question.locator.kind === 'col' ? question.locator.col : undefined}
          selectable={isCellSet && !submitted}
          selectedCells={isCellSet ? selectedCells : undefined}
          onToggleCell={isCellSet ? handleToggleCell : undefined}
        />
      )}

      {game.representation.kind === 'extensive-form' && (
        <ExtensiveFormTree
          game={game.representation}
          highlightNodeId={question.locator.kind === 'node' ? question.locator.nodeId : undefined}
        />
      )}

      {game.representation.kind === 'scenario' && <p className={styles.scenarioText}>{game.representation.setupText}</p>}

      {isCellSet && !submitted && <p className={styles.hint}>Click cells to select or deselect them.</p>}

      {question.answer.kind === 'numeric' && (
        <NumericInput
          value={draft?.kind === 'numeric' ? draft.value : undefined}
          onChange={(value) => setDraft({ kind: 'numeric', value })}
          disabled={submitted}
        />
      )}

      {question.answer.kind === 'multiple-choice' && (
        <MultipleChoiceInput
          options={question.answer.options}
          value={draft?.kind === 'multiple-choice' ? draft.value : undefined}
          onChange={(value) => setDraft({ kind: 'multiple-choice', value })}
          disabled={submitted}
        />
      )}

      {question.answer.kind === 'action' && (
        <ActionChoiceInput
          actions={nodeActions}
          value={draft?.kind === 'action' ? draft.value : undefined}
          onChange={(value) => setDraft({ kind: 'action', value })}
          disabled={submitted}
        />
      )}

      {question.answer.kind === 'strategy' && (
        <StrategyChoiceInput
          strategies={subjectStrategies}
          value={draft?.kind === 'strategy' ? draft.value : undefined}
          onChange={(value) => value !== null && setDraft({ kind: 'strategy', value })}
          disabled={submitted}
        />
      )}

      {question.answer.kind === 'strategy-or-none' && (
        <StrategyChoiceInput
          strategies={subjectStrategies}
          allowNone
          value={draft?.kind === 'strategy-or-none' ? draft.value : undefined}
          onChange={(value) => setDraft({ kind: 'strategy-or-none', value })}
          disabled={submitted}
        />
      )}

      <div className={styles.actions}>
        {!submitted && (
          <button type="button" className={styles.submitButton} disabled={!canSubmit} onClick={handleSubmit}>
            Submit
          </button>
        )}
        {submitted && onNext && (
          <button type="button" className={styles.nextButton} onClick={onNext}>
            Next Question
          </button>
        )}
      </div>

      {result && <FeedbackPanel result={result} />}
    </div>
  )
}
