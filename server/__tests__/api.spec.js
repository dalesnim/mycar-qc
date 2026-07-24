import { describe, it, expect, afterEach } from 'vitest'
import { existsSync, unlinkSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import { createDb } from '../db.js'
import { pdiSummary } from '../report.js'
import { checklistItems } from '../rules.js'

const allPass = checklistItems.map((c) => ({ key: c.key, label: c.label, result: 'pass', comment: '' }))

const file = os.tmpdir() + '/mycar-test-' + Date.now() + '.json'

afterEach(() => {
  if (existsSync(file)) unlinkSync(file)
})

const goodDefect = {
  vin: 'VIN1',
  zone: 'капот',
  x: 10,
  y: 20,
  typeId: 'd1',
  severity: 'high',
  comment: 'скол',
}

describe('api дефектов', () => {
  it('создание валидного дефекта', () => {
    const db = createDb()
    const res = db.create(goodDefect, 'inspector')
    expect(res.status).toBe(201)
    expect(res.body.id).toBeTruthy()
    expect(res.body.status).toBe('new')
    expect(db.list('VIN1').length).toBe(1)
  })

  it('создание без typeId - ошибка 400 и дефект не создаётся', () => {
    const db = createDb()
    const res = db.create({ vin: 'VIN1', zone: 'капот', x: 1, y: 1 }, 'inspector')
    expect(res.status).toBe(400)
    expect(res.body.errors).toContain('Выберите тип дефекта')
    expect(db.list().length).toBe(0)
  })

  it('смена статуса по FSM работает', () => {
    const db = createDb()
    const id = db.create(goodDefect, 'inspector').body.id
    expect(db.update(id, { status: 'in_repair' }, 'master').status).toBe(200)
    expect(db.update(id, { status: 'resolved' }, 'master').status).toBe(200)
  })

  it('недопустимый переход - ошибка 400', () => {
    const db = createDb()
    const id = db.create(goodDefect, 'inspector').body.id
    db.update(id, { status: 'in_repair' }, 'master')
    db.update(id, { status: 'resolved' }, 'master')
    const res = db.update(id, { status: 'new' }, 'master')
    expect(res.status).toBe(400)
  })

  it('удаление несуществующего id - 404 без падения', () => {
    const db = createDb()
    expect(db.remove('нет такого', 'inspector').status).toBe(404)
  })

  it('данные переживают перезапуск', () => {
    const db1 = createDb(file)
    db1.create(goodDefect, 'inspector')
    const db2 = createDb(file)
    expect(db2.list('VIN1').length).toBe(1)
    expect(db2.list('VIN1')[0].zone).toBe('капот')
  })

  it('битый файл хранилища - старт с пустого списка', () => {
    writeFileSync(file, 'это не json')
    const db = createDb(file)
    expect(db.list().length).toBe(0)
  })
})

describe('отчёт PDI', () => {
  it('3 дефекта, 2 устранено, 1 новый - годен НЕТ', () => {
    const defects = [
      { status: 'resolved' },
      { status: 'resolved' },
      { status: 'new' },
    ]
    const s = pdiSummary(defects)
    expect(s.total).toBe(3)
    expect(s.resolved).toBe(2)
    expect(s.open).toBe(1)
    expect(s.fit).toBe(false)
  })

  it('нет дефектов и чек-лист пройден - годен ДА', () => {
    const s = pdiSummary([], allPass)
    expect(s.total).toBe(0)
    expect(s.fit).toBe(true)
  })

  it('только отклонённые и чек-лист пройден - годен ДА', () => {
    const s = pdiSummary([{ status: 'rejected' }], allPass)
    expect(s.fit).toBe(true)
    expect(s.rejected).toBe(1)
  })
})
