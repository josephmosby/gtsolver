import { describe, expect, it } from 'vitest'
import { gameGenerators } from '../../data/games/index'
import {
  allParetoOptimalCells,
  backwardInduction,
  computeDominantStrategy,
  computeNashEquilibria,
} from '../../engine/gameUtils'
import { cellSetEqual } from '../../engine/matrixCell'
import { mulberry32 } from '../../engine/random'

const TRIALS = 50

describe('generated normal-form answers match pure computation across many random seeds', () => {
  for (const [gameId, generate] of Object.entries(gameGenerators)) {
    it(`${gameId}`, () => {
      for (let seed = 0; seed < TRIALS; seed++) {
        const { game, questions } = generate(mulberry32(seed))
        if (game.representation.kind !== 'normal-form') return // not applicable to this game; skip
        const nf = game.representation

        for (const question of questions) {
          if (question.type === 'nash-equilibrium-cell' && question.answer.kind === 'cell-set') {
            expect(cellSetEqual(question.answer.correct, computeNashEquilibria(nf)), `seed ${seed}, ${question.id}`).toBe(true)
          }
          if (question.type === 'pareto-comparison' && question.answer.kind === 'cell-set') {
            expect(cellSetEqual(question.answer.correct, allParetoOptimalCells(nf)), `seed ${seed}, ${question.id}`).toBe(true)
          }
          if (question.type === 'dominant-strategy' && question.answer.kind === 'strategy-or-none' && question.subjectPlayer) {
            const playerIndex: 0 | 1 = nf.players[0] === question.subjectPlayer ? 0 : 1
            expect(computeDominantStrategy(nf, playerIndex), `seed ${seed}, ${question.id}`).toBe(question.answer.correct)
          }
        }
      }
    })
  }
})

describe('generated extensive-form answers match backwardInduction across many random seeds', () => {
  for (const [gameId, generate] of Object.entries(gameGenerators)) {
    it(`${gameId}`, () => {
      for (let seed = 0; seed < TRIALS; seed++) {
        const { game, questions } = generate(mulberry32(seed))
        if (game.representation.kind !== 'extensive-form') return // not applicable to this game; skip
        const ef = game.representation
        const solved = backwardInduction(ef)

        for (const question of questions) {
          if (question.type === 'node-decision' && question.answer.kind === 'action' && question.locator.kind === 'node') {
            expect(solved[question.locator.nodeId].action, `seed ${seed}, ${question.id}`).toBe(question.answer.correct)
          }
        }
      }
    })
  }
})
