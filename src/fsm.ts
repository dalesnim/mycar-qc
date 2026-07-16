import type { Status } from './type'

// словарь переходов: из какого статуса куда можно перейти
export const transitions: Record<Status, Status[]> = {
  new: ['in_repair'],
  in_repair: ['resolved', 'rejected'],
  resolved: [],
  rejected: [],
}

// проверяет можно ли перейти из from в to
export function canTransition(from: Status, to: Status): boolean {
  return transitions[from].includes(to)
}
