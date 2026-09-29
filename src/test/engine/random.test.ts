import { describe, expect, it } from 'vitest'
import { mulberry32, pick, randInt, shuffle } from '../../engine/random'

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    const seqA = Array.from({ length: 5 }, () => a())
    const seqB = Array.from({ length: 5 }, () => b())
    expect(seqA).toEqual(seqB)
  })

  it('produces values in [0, 1)', () => {
    const rng = mulberry32(1)
    for (let i = 0; i < 200; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('different seeds produce different sequences', () => {
    const a = mulberry32(1)()
    const b = mulberry32(2)()
    expect(a).not.toBe(b)
  })
})

describe('randInt', () => {
  it('stays within [min, max] inclusive across many draws', () => {
    const rng = mulberry32(7)
    for (let i = 0; i < 500; i++) {
      const v = randInt(rng, 3, 8)
      expect(v).toBeGreaterThanOrEqual(3)
      expect(v).toBeLessThanOrEqual(8)
      expect(Number.isInteger(v)).toBe(true)
    }
  })

  it('handles a degenerate min===max range', () => {
    const rng = mulberry32(1)
    expect(randInt(rng, 5, 5)).toBe(5)
  })
})

describe('pick', () => {
  it('always returns an element from the input array', () => {
    const rng = mulberry32(3)
    const items = ['a', 'b', 'c']
    for (let i = 0; i < 50; i++) {
      expect(items).toContain(pick(rng, items))
    }
  })
})

describe('shuffle', () => {
  it('returns a permutation of the same elements without mutating the input', () => {
    const rng = mulberry32(9)
    const items = [1, 2, 3, 4, 5]
    const result = shuffle(rng, items)
    expect(items).toEqual([1, 2, 3, 4, 5])
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5])
  })
})
