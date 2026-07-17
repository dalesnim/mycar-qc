import crypto from 'node:crypto'
import { loadData, saveData } from './storage.js'
import { canTransition, validateDefect } from './rules.js'

const startTypes = [
  { id: 'd1', name: 'окраска', category: 'покрытие' },
  { id: 'd2', name: 'вмятина', category: 'форма' },
  { id: 'd3', name: 'зазор', category: 'форма' },
  { id: 'd4', name: 'скол', category: 'покрытие' },
]

export function createDb(file) {
  const data = file ? loadData(file) : { defects: [], defectTypes: null }
  const defects = data.defects
  const defectTypes = data.defectTypes || [...startTypes]

  function persist() {
    if (file) saveData(file, { defects, defectTypes })
  }

  return {
    list(vin) {
      if (vin) return defects.filter((d) => d.vin === vin)
      return defects
    },

    create(body) {
      const errors = validateDefect(body)
      if (errors.length > 0) return { status: 400, body: { errors } }
      const defect = {
        id: crypto.randomUUID(),
        vin: body.vin || '',
        zone: body.zone,
        x: body.x,
        y: body.y,
        typeId: body.typeId,
        severity: body.severity || 'low',
        status: 'new',
        comment: body.comment || '',
        createdAt: new Date().toISOString().slice(0, 10),
      }
      defects.push(defect)
      persist()
      return { status: 201, body: defect }
    },

    update(id, patch) {
      const defect = defects.find((d) => d.id === id)
      if (!defect) return { status: 404, body: { errors: ['Дефект не найден'] } }
      if (patch.status && patch.status !== defect.status) {
        if (!canTransition(defect.status, patch.status)) {
          return {
            status: 400,
            body: { errors: ['Недопустимый переход: ' + defect.status + ' -> ' + patch.status] },
          }
        }
      }
      const updated = { ...defect, ...patch }
      const errors = validateDefect(updated)
      if (errors.length > 0) return { status: 400, body: { errors } }
      Object.assign(defect, patch)
      persist()
      return { status: 200, body: defect }
    },

    remove(id) {
      const index = defects.findIndex((d) => d.id === id)
      if (index === -1) return { status: 404, body: { errors: ['Дефект не найден'] } }
      defects.splice(index, 1)
      persist()
      return { status: 200, body: { ok: true } }
    },

    types() {
      return defectTypes
    },

    addType(body) {
      if (!body.name) return { status: 400, body: { errors: ['Укажите название типа'] } }
      const type = {
        id: crypto.randomUUID(),
        name: body.name,
        category: body.category || '',
      }
      defectTypes.push(type)
      persist()
      return { status: 201, body: type }
    },
  }
}
