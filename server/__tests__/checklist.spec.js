import { describe, it, expect } from 'vitest'
import { createDb } from '../db.js'
import { isFit } from '../report.js'
import { checklistItems } from '../rules.js'

function filled(result) {
  return checklistItems.map((c) => ({ key: c.key, result: result, comment: '' }))
}

describe('чек-лист PDI', () => {
  it('новый vin - пустой шаблон из всех пунктов', () => {
    const db = createDb()
    const list = db.getChecklist('VIN9')
    expect(list.length).toBe(checklistItems.length)
    expect(list[0].result).toBe('')
  })

  it('заполнить и прочитать обратно', () => {
    const db = createDb()
    const res = db.saveChecklist('VIN1', filled('pass'), 'inspector')
    expect(res.status).toBe(200)
    expect(db.getChecklist('VIN1').every((c) => c.result === 'pass')).toBe(true)
  })

  it('мастер не может заполнять чек-лист - 403', () => {
    const db = createDb()
    expect(db.saveChecklist('VIN1', filled('pass'), 'master').status).toBe(403)
  })

  it('выдуманный результат пункта - 400', () => {
    const db = createDb()
    const bad = [{ key: 'paint', result: 'отлично', comment: '' }]
    const res = db.saveChecklist('VIN1', bad, 'inspector')
    expect(res.status).toBe(400)
  })

  it('чек-лист не список - 400, не падаем', () => {
    const db = createDb()
    expect(db.saveChecklist('VIN1', null, 'inspector').status).toBe(400)
    expect(db.saveChecklist('VIN1', 'привет', 'inspector').status).toBe(400)
  })
})

describe('правило годности с чек-листом', () => {
  it('все pass и нет открытых дефектов - годен', () => {
    expect(isFit([], filled('pass'))).toBe(true)
    expect(isFit([{ status: 'resolved' }], filled('na'))).toBe(true)
  })

  it('один пункт fail - не годен даже без дефектов', () => {
    const list = filled('pass')
    list[3].result = 'fail'
    expect(isFit([], list)).toBe(false)
  })

  it('не все пункты заполнены - не годен', () => {
    const list = filled('pass')
    list[0].result = ''
    expect(isFit([], list)).toBe(false)
    expect(isFit([], [])).toBe(false)
  })

  it('открытый дефект - не годен даже с пройденным чек-листом', () => {
    expect(isFit([{ status: 'new' }], filled('pass'))).toBe(false)
  })
})

describe('дашборд качества', () => {
  const defect = { vin: 'VIN1', zone: 'капот', x: 1, y: 2, typeId: 'd1', severity: 'low' }

  it('считает по типам и зонам и находит топ зону', () => {
    const db = createDb()
    db.create(defect, 'inspector')
    db.create({ ...defect, zone: 'капот', typeId: 'd2' }, 'inspector')
    db.create({ ...defect, zone: 'крыша' }, 'inspector')
    const a = db.analytics()
    expect(a.byZone[0]).toEqual({ zone: 'капот', count: 2 })
    expect(a.topZones[0].zone).toBe('капот')
    expect(a.byType.find((t) => t.typeId === 'd1').count).toBe(2)
  })

  it('passRate: один кузов годен из двух - 0.5', () => {
    const db = createDb()
    db.create({ ...defect, vin: 'VIN1' }, 'inspector')
    db.saveChecklist('VIN2', filled('pass'), 'inspector')
    const a = db.analytics()
    expect(a.passRate).toBe(0.5)
  })

  it('нет данных - нули и passRate null, без ошибок', () => {
    const db = createDb()
    const a = db.analytics()
    expect(a.byType.length).toBe(0)
    expect(a.byZone.length).toBe(0)
    expect(a.passRate).toBe(null)
  })
})
