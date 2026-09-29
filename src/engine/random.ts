export type RNG = () => number

/** Deterministic seedable PRNG (mulberry32) — used by tests to reproduce a specific instance. */
export function mulberry32(seed: number): RNG {
  let a = seed
  return function rng() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Random integer in [min, max], inclusive of both ends. */
export function randInt(rng: RNG, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

export function pick<T>(rng: RNG, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]
}

/** Fisher-Yates shuffle. Does not mutate the input. */
export function shuffle<T>(rng: RNG, items: readonly T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
