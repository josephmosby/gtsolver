import { createEmptyProgress, PROGRESS_STORAGE_KEY } from '../types/progress'
import type { ProgressStateV1 } from '../types/progress'

function migrateProgress(raw: unknown): ProgressStateV1 {
  if (raw && typeof raw === 'object' && (raw as { version?: unknown }).version === 1) {
    return raw as ProgressStateV1
  }
  // Unknown/older shape — start fresh rather than risk crashing on malformed data.
  return createEmptyProgress()
}

export function loadProgress(): ProgressStateV1 {
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (!raw) return createEmptyProgress()
    return migrateProgress(JSON.parse(raw))
  } catch {
    return createEmptyProgress()
  }
}

export function saveProgress(state: ProgressStateV1): void {
  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage unavailable (private browsing, quota exceeded) — progress just won't persist.
  }
}
