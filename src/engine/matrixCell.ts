import type { MatrixCell } from '../types/question'

export function cellKey(cell: MatrixCell): string {
  return `${cell.row}|${cell.col}`
}

export function cellSetEqual(a: MatrixCell[], b: MatrixCell[]): boolean {
  if (a.length !== b.length) return false
  const aKeys = new Set(a.map(cellKey))
  return b.every((cell) => aKeys.has(cellKey(cell)))
}
