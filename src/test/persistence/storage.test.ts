import { beforeEach, describe, expect, it } from 'vitest'
import { loadProgress, saveProgress } from '../../persistence/storage'
import { createEmptyProgress, PROGRESS_STORAGE_KEY } from '../../types/progress'

describe('storage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns an empty progress state when nothing is stored', () => {
    expect(loadProgress()).toEqual(createEmptyProgress())
  })

  it('round-trips a saved progress state', () => {
    const state = {
      ...createEmptyProgress(),
      perConcept: { 'dominant-strategy': { attempts: 2, correct: 1, streak: 0, lastMisconceptions: [] } },
    }
    saveProgress(state)
    expect(loadProgress()).toEqual(state)
  })

  it('falls back to an empty state when the stored value is malformed JSON', () => {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, '{not json')
    expect(loadProgress()).toEqual(createEmptyProgress())
  })

  it('falls back to an empty state when the stored value has an unrecognized version', () => {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ version: 99 }))
    expect(loadProgress()).toEqual(createEmptyProgress())
  })
})
