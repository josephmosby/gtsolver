import '@testing-library/jest-dom/vitest'

// Node's built-in localStorage (requires --localstorage-file) can shadow jsdom's
// implementation inside the test worker and leave it non-functional. Install a
// simple in-memory polyfill so storage tests behave predictably either way.
class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length() {
    return this.store.size
  }

  clear() {
    this.store.clear()
  }

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null
  }

  removeItem(key: string) {
    this.store.delete(key)
  }

  setItem(key: string, value: string) {
    this.store.set(key, String(value))
  }
}

const memoryStorage = new MemoryStorage()

for (const target of [globalThis, typeof window !== 'undefined' ? window : undefined]) {
  if (!target) continue
  Object.defineProperty(target, 'localStorage', {
    value: memoryStorage,
    writable: true,
    configurable: true,
  })
}
