
export const transitions = {
  new: ['in_repair'],
  in_repair: ['resolved', 'rejected'],
  resolved: [],
  rejected: [],
}

const severities = ['low', 'high', 'critical']

export function canTransition(from, to) {
  return (transitions[from] || []).includes(to)
}

export function validateDefect(d) {
  if (!d || typeof d !== 'object') return ['Нет данных дефекта']
  const errors = []
  if (typeof d.typeId !== 'string' || d.typeId.trim() === '') {
    errors.push('Выберите тип дефекта')
  }
  if (typeof d.zone !== 'string' || d.zone.trim() === '') {
    errors.push('Укажите зону')
  }
  if (typeof d.x !== 'number' || typeof d.y !== 'number' || isNaN(d.x) || isNaN(d.y)) {
    errors.push('Координаты x и y должны быть числами')
  }
  if (d.severity !== undefined && !severities.includes(d.severity)) {
    errors.push('Серьёзность может быть только low, high или critical')
  }
  return errors
}

export const checklistItems = [
  { key: 'paint', label: 'ЛКП (краска)' },
  { key: 'glass', label: 'Стёкла' },
  { key: 'lights', label: 'Свет' },
  { key: 'brakes', label: 'Тормоза' },
  { key: 'interior', label: 'Салон' },
]

const checkResults = ['pass', 'fail', 'na']

export function validateChecklist(items) {
  if (!Array.isArray(items)) return ['Чек-лист должен быть списком пунктов']
  const errors = []
  for (const item of items) {
    if (!item || !checklistItems.find((c) => c.key === item.key)) {
      errors.push('Неизвестный пункт чек-листа: ' + (item ? item.key : 'пусто'))
    } else if (!checkResults.includes(item.result)) {
      errors.push('Результат пункта ' + item.key + ' может быть только pass, fail или na')
    }
  }
  return errors
}
