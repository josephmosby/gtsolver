import { describe, expect, it } from 'vitest'
import type { ExtensiveFormGame, NormalFormGame } from '../../types/game'
import {
  allParetoOptimalCells,
  backwardInduction,
  computeDominantStrategies,
  computeNashEquilibria,
  isParetoOptimal,
  layoutTree,
} from '../../engine/gameUtils'

const prisonersDilemma: NormalFormGame = {
  kind: 'normal-form',
  players: ['Row', 'Col'],
  strategies: { Row: ['Cooperate', 'Defect'], Col: ['Cooperate', 'Defect'] },
  payoffs: {
    'Cooperate|Cooperate': [3, 3],
    'Cooperate|Defect': [0, 5],
    'Defect|Cooperate': [5, 0],
    'Defect|Defect': [1, 1],
  },
}

const stagHunt: NormalFormGame = {
  kind: 'normal-form',
  players: ['Row', 'Col'],
  strategies: { Row: ['Stag', 'Hare'], Col: ['Stag', 'Hare'] },
  payoffs: {
    'Stag|Stag': [4, 4],
    'Stag|Hare': [0, 3],
    'Hare|Stag': [3, 0],
    'Hare|Hare': [2, 2],
  },
}

describe('computeNashEquilibria', () => {
  it('finds the single dominant-strategy equilibrium in Prisoner\'s Dilemma', () => {
    expect(computeNashEquilibria(prisonersDilemma)).toEqual([{ row: 'Defect', col: 'Defect' }])
  })

  it('finds both pure equilibria in Stag Hunt', () => {
    expect(computeNashEquilibria(stagHunt)).toEqual([
      { row: 'Stag', col: 'Stag' },
      { row: 'Hare', col: 'Hare' },
    ])
  })
})

describe('computeDominantStrategies', () => {
  it('finds Defect as dominant for both players in Prisoner\'s Dilemma', () => {
    expect(computeDominantStrategies(prisonersDilemma)).toEqual({ row: 'Defect', col: 'Defect' })
  })

  it('finds no dominant strategy in Stag Hunt', () => {
    expect(computeDominantStrategies(stagHunt)).toEqual({ row: null, col: null })
  })
})

describe('isParetoOptimal / allParetoOptimalCells', () => {
  it('flags mutual defection as not Pareto optimal in Prisoner\'s Dilemma', () => {
    expect(isParetoOptimal(prisonersDilemma, { row: 'Defect', col: 'Defect' })).toBe(false)
  })

  it('flags mutual cooperation as Pareto optimal in Prisoner\'s Dilemma', () => {
    expect(isParetoOptimal(prisonersDilemma, { row: 'Cooperate', col: 'Cooperate' })).toBe(true)
  })

  it('collects all three Pareto-optimal cells in Prisoner\'s Dilemma', () => {
    const cells = allParetoOptimalCells(prisonersDilemma)
    expect(cells).toHaveLength(3)
    expect(cells).not.toContainEqual({ row: 'Defect', col: 'Defect' })
  })
})

const trustGame: ExtensiveFormGame = {
  kind: 'extensive-form',
  players: ['Investor', 'Trustee'],
  rootId: 'invest-decision',
  nodes: {
    'invest-decision': {
      id: 'invest-decision',
      type: 'decision',
      player: 'Investor',
      actions: [
        { label: 'Trust', targetNodeId: 'trustee-decision' },
        { label: 'Not Trust', targetNodeId: 'no-trust' },
      ],
    },
    'trustee-decision': {
      id: 'trustee-decision',
      type: 'decision',
      player: 'Trustee',
      actions: [
        { label: 'Honor', targetNodeId: 'honor' },
        { label: 'Betray', targetNodeId: 'betray' },
      ],
    },
    'no-trust': { id: 'no-trust', type: 'terminal', payoffs: { Investor: 5, Trustee: 5 } },
    honor: { id: 'honor', type: 'terminal', payoffs: { Investor: 10, Trustee: 10 } },
    betray: { id: 'betray', type: 'terminal', payoffs: { Investor: 0, Trustee: 15 } },
  },
}

describe('backwardInduction', () => {
  it('has the trustee betray, since it strictly beats honoring', () => {
    const result = backwardInduction(trustGame)
    expect(result['trustee-decision'].action).toBe('Betray')
    expect(result['trustee-decision'].payoffs).toEqual({ Investor: 0, Trustee: 15 })
  })

  it('has the investor withhold trust, anticipating betrayal (trust unravels)', () => {
    const result = backwardInduction(trustGame)
    expect(result['invest-decision'].action).toBe('Not Trust')
    expect(result['invest-decision'].payoffs).toEqual({ Investor: 5, Trustee: 5 })
  })
})

describe('layoutTree', () => {
  it('places the root at depth 0 and leaves at depth 1 or deeper', () => {
    const layout = layoutTree(trustGame)
    expect(layout['invest-decision'].y).toBe(0)
    expect(layout['no-trust'].y).toBe(1)
    expect(layout['trustee-decision'].y).toBe(1)
    expect(layout.honor.y).toBe(2)
    expect(layout.betray.y).toBe(2)
  })

  it('assigns distinct x positions to every leaf', () => {
    const layout = layoutTree(trustGame)
    const leafXs = [layout['no-trust'].x, layout.honor.x, layout.betray.x]
    expect(new Set(leafXs).size).toBe(3)
  })
})
