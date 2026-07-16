import type { Status } from './type'

export const transitions: Record<Status, Status[]> = {
  new: ['in_repair'],
  in_repair: ['resolved', 'rejected'],
  resolved: [],
  rejected: [],
}

export function canTransition(from: Status, to: Status): boolean {
  return transitions[from].includes(to)
}
