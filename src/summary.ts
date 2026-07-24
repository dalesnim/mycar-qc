import type { Defect, Status, ChecklistItem } from './type'

export function isFit(defects: Defect[], checklist: ChecklistItem[]): boolean {
  const open = defects.some((d) => d.status === 'new' || d.status === 'in_repair')
  if (open) return false
  if (checklist.length === 0) return false
  return checklist.every((c) => c.result === 'pass' || c.result === 'na')
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
