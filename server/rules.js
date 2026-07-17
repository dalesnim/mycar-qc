export const transitions = {
  new: ['in_repair'],
  in_repair: ['resolved', 'rejected'],
  resolved: [],
  rejected: [],
}

export function canTransition(from, to) {
  return (transitions[from] || []).includes(to)
}

export function validateDefect(d) {
  const errors = []
  if (!d.typeId) errors.push('Выберите тип дефекта')
  if (!d.zone || d.zone.trim() === '') errors.push('Укажите зону')
  return errors
}
