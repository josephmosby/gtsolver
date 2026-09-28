import { describe, expect, it } from 'vitest'
import { allQuestions, gamesById } from '../../data/games/index'
import type { GameDefinition } from '../../types/game'
import type { Question } from '../../types/question'

function strategiesFor(game: GameDefinition, player: string): string[] {
  if (game.representation.kind !== 'normal-form') return []
  return game.representation.strategies[player] ?? []
}

/** Validates that a question's locator/answer/subjectPlayer actually resolve against its game. */
function validateQuestion(question: Question, game: GameDefinition | undefined): string[] {
  const errors: string[] = []
  const prefix = `[${question.id}]`

  if (!game) {
    return [`${prefix} references unknown gameId "${question.gameId}"`]
  }

  if (question.subjectPlayer && game.representation.kind === 'normal-form') {
    if (!game.representation.players.includes(question.subjectPlayer)) {
      errors.push(`${prefix} subjectPlayer "${question.subjectPlayer}" is not a player in "${game.id}"`)
    }
  }

  const rep = game.representation
  switch (rep.kind) {
    case 'normal-form': {
      const [rowPlayer, colPlayer] = rep.players
      const rowStrategies = rep.strategies[rowPlayer] ?? []
      const colStrategies = rep.strategies[colPlayer] ?? []

      if (question.locator.kind === 'cell') {
        if (!rowStrategies.includes(question.locator.row)) {
          errors.push(`${prefix} locator row "${question.locator.row}" is not a valid Row strategy`)
        }
        if (!colStrategies.includes(question.locator.col)) {
          errors.push(`${prefix} locator col "${question.locator.col}" is not a valid Col strategy`)
        }
      } else if (question.locator.kind === 'row') {
        if (!rowStrategies.includes(question.locator.row)) {
          errors.push(`${prefix} locator row "${question.locator.row}" is not a valid Row strategy`)
        }
      } else if (question.locator.kind === 'col') {
        if (!colStrategies.includes(question.locator.col)) {
          errors.push(`${prefix} locator col "${question.locator.col}" is not a valid Col strategy`)
        }
      } else if (question.locator.kind === 'node' || question.locator.kind === 'information-set') {
        errors.push(`${prefix} uses a node/information-set locator on a normal-form game`)
      }

      const subjectStrategies = question.subjectPlayer ? strategiesFor(game, question.subjectPlayer) : []
      if (question.answer.kind === 'strategy') {
        if (!subjectStrategies.includes(question.answer.correct)) {
          errors.push(`${prefix} answer strategy "${question.answer.correct}" is not valid for subjectPlayer`)
        }
      } else if (question.answer.kind === 'strategy-or-none') {
        if (question.answer.correct !== null && !subjectStrategies.includes(question.answer.correct)) {
          errors.push(`${prefix} answer strategy "${question.answer.correct}" is not valid for subjectPlayer`)
        }
      } else if (question.answer.kind === 'cell-set') {
        for (const cell of question.answer.correct) {
          if (!rowStrategies.includes(cell.row) || !colStrategies.includes(cell.col)) {
            errors.push(`${prefix} answer cell (${cell.row}, ${cell.col}) is not a valid cell`)
          }
        }
      }
      break
    }
    case 'extensive-form': {
      const nodeIds = Object.keys(rep.nodes)
      if (question.locator.kind === 'node' && !nodeIds.includes(question.locator.nodeId)) {
        errors.push(`${prefix} locator nodeId "${question.locator.nodeId}" does not exist in "${game.id}"`)
      }
      if (question.locator.kind === 'cell' || question.locator.kind === 'row' || question.locator.kind === 'col') {
        errors.push(`${prefix} uses a matrix locator on an extensive-form game`)
      }
      if (question.answer.kind === 'action' && question.locator.kind === 'node') {
        const node = rep.nodes[question.locator.nodeId]
        const validActions = node?.actions?.map((a) => a.label) ?? []
        if (!validActions.includes(question.answer.correct)) {
          errors.push(`${prefix} answer action "${question.answer.correct}" is not a valid action at node "${question.locator.nodeId}"`)
        }
      }
      break
    }
    case 'scenario': {
      if (question.locator.kind !== 'none') {
        errors.push(`${prefix} uses a non-"none" locator on a scenario game`)
      }
      break
    }
  }

  return errors
}

describe('content integrity', () => {
  it('every question resolves against its game', () => {
    const allErrors = allQuestions.flatMap((question) => validateQuestion(question, gamesById[question.gameId]))
    expect(allErrors).toEqual([])
  })

  it('every question has a non-empty prompt and explanation', () => {
    for (const question of allQuestions) {
      expect(question.prompt.trim(), `${question.id} has an empty prompt`).not.toBe('')
      expect(question.explanation.trim(), `${question.id} has an empty explanation`).not.toBe('')
    }
  })

  it('question ids are unique', () => {
    const ids = allQuestions.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
