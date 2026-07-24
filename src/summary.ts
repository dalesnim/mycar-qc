import type { Defect, Status } from './type'

export function isFit(defects: Defect[]): boolean {
  return !defects.some((d) => d.status === 'new' || d.status === 'in_repair')
}

export function countByStatus(defects: Defect[]): Record<Status, number> {
  const counts: Record<Status, number> = {
    new: 0,
    in_repair: 0,
    resolved: 0,
    rejected: 0,
  }
  for (const d of defects) {
    counts[d.status]++
  }
  return counts
}
