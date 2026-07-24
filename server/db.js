import crypto from 'node:crypto'
import { loadData, saveData } from './storage.js'
import { canTransition, validateDefect } from './rules.js'
import { log } from './logger.js'

const startTypes = [
  { id: 'd1', name: 'окраска', category: 'покрытие' },
  { id: 'd2', name: 'вмятина', category: 'форма' },
  { id: 'd3', name: 'зазор', category: 'форма' },
  { id: 'd4', name: 'скол', category: 'покрытие' },
]

function checkRole(role, needed) {
  if (!role) {
    return { status: 403, body: { errors: ['Не указана роль (заголовок x-role)'] } }
  }
  if (role !== needed) {
    return { status: 403, body: { errors: ['Нет прав, это может делать только ' + needed] } }
  }
  return null
}

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

    create(body, role) {
      const roleError = checkRole(role, 'inspector')
      if (roleError) return roleError
      const errors = validateDefect(body)
      if (errors.length > 0) return { status: 400, body: { errors } }
      const defect = {
        id: crypto.randomUUID(),
        vin: typeof body.vin === 'string' ? body.vin : '',
        zone: body.zone.trim(),
        x: body.x,
        y: body.y,
        typeId: body.typeId,
        severity: body.severity || 'low',
        status: 'new',
        comment: typeof body.comment === 'string' ? body.comment : '',
        createdAt: new Date().toISOString().slice(0, 10),
      }
      defects.push(defect)
      persist()
      log('создан дефект ' + defect.id + ' (' + defect.zone + ')')
      return { status: 201, body: defect }
    },

    update(id, patch, role) {
      if (!patch || typeof patch !== 'object') {
        return { status: 400, body: { errors: ['Нет данных для изменения'] } }
      }
      const defect = defects.find((d) => d.id === id)
      if (!defect) return { status: 404, body: { errors: ['Дефект не найден'] } }

      const changesStatus = 'status' in patch && patch.status !== defect.status
      const roleError = checkRole(role, changesStatus ? 'master' : 'inspector')
      if (roleError) return roleError

      if (changesStatus && !canTransition(defect.status, patch.status)) {
        return {
          status: 400,
          body: { errors: ['Недопустимый переход: ' + defect.status + ' -> ' + patch.status] },
        }
      }

      const allowed = changesStatus ? ['status'] : ['zone', 'typeId', 'severity', 'comment']
      const cleanPatch = {}
      for (const key of allowed) {
        if (key in patch) cleanPatch[key] = patch[key]
      }
      if (typeof cleanPatch.zone === 'string') cleanPatch.zone = cleanPatch.zone.trim()

      const updated = { ...defect, ...cleanPatch }
      const errors = validateDefect(updated)
      if (errors.length > 0) return { status: 400, body: { errors } }

      Object.assign(defect, cleanPatch)
      persist()
      log('изменён дефект ' + id + (changesStatus ? ' (статус -> ' + patch.status + ')' : ''))
      return { status: 200, body: defect }
    },

    remove(id, role) {
      const roleError = checkRole(role, 'inspector')
      if (roleError) return roleError
      const index = defects.findIndex((d) => d.id === id)
      if (index === -1) return { status: 404, body: { errors: ['Дефект не найден'] } }
      defects.splice(index, 1)
      persist()
      log('удалён дефект ' + id)
      return { status: 200, body: { ok: true } }
    },

    types() {
      return defectTypes
    },

    addType(body, role) {
      const roleError = checkRole(role, 'inspector')
      if (roleError) return roleError
      if (!body || typeof body.name !== 'string' || body.name.trim() === '') {
        return { status: 400, body: { errors: ['Укажите название типа'] } }
      }
      const type = {
        id: crypto.randomUUID(),
        name: body.name.trim(),
        category: typeof body.category === 'string' ? body.category : '',
      }
      defectTypes.push(type)
      persist()
      return { status: 201, body: type }
    },
  }
}
