import { describe, expect, it } from 'vitest'
import { allQuestions, gamesById } from '../../data/games/index'
import {
  allParetoOptimalCells,
  backwardInduction,
  computeDominantStrategy,
  computeNashEquilibria,
} from '../../engine/gameUtils'
import { cellSetEqual } from '../../engine/matrixCell'

describe('authored normal-form answers match pure computation', () => {
  for (const question of allQuestions) {
    const game = gamesById[question.gameId]
    if (game.representation.kind !== 'normal-form') continue
    const nf = game.representation

    if (question.type === 'nash-equilibrium-cell' && question.answer.kind === 'cell-set') {
      it(`${question.id}: matches computeNashEquilibria`, () => {
        expect(cellSetEqual(question.answer.kind === 'cell-set' ? question.answer.correct : [], computeNashEquilibria(nf))).toBe(true)
      })
    }

    if (question.type === 'pareto-comparison' && question.answer.kind === 'cell-set') {
      it(`${question.id}: matches allParetoOptimalCells`, () => {
        expect(cellSetEqual(question.answer.kind === 'cell-set' ? question.answer.correct : [], allParetoOptimalCells(nf))).toBe(true)
      })
    }

    if (question.type === 'dominant-strategy' && question.answer.kind === 'strategy-or-none' && question.subjectPlayer) {
      it(`${question.id}: matches computeDominantStrategy`, () => {
        const playerIndex: 0 | 1 = nf.players[0] === question.subjectPlayer ? 0 : 1
        expect(computeDominantStrategy(nf, playerIndex)).toBe(question.answer.kind === 'strategy-or-none' ? question.answer.correct : undefined)
      })
    }
  }
})

describe('authored extensive-form answers match backwardInduction', () => {
  for (const question of allQuestions) {
    const game = gamesById[question.gameId]
    if (game.representation.kind !== 'extensive-form') continue
    if (question.type !== 'node-decision' || question.answer.kind !== 'action' || question.locator.kind !== 'node') continue
    const ef = game.representation
    const nodeId = question.locator.nodeId

    it(`${question.id}: matches backwardInduction`, () => {
      expect(backwardInduction(ef)[nodeId].action).toBe(question.answer.kind === 'action' ? question.answer.correct : undefined)
    })
  }
})
