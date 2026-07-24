import { describe, it, expect } from 'vitest'
import { writeFileSync, unlinkSync } from 'node:fs'
import os from 'node:os'
import { createDb } from '../db.js'
import { pdiSummary, pdiHtml } from '../report.js'

const goodDefect = {
  vin: 'VIN1',
  zone: 'капот',
  x: 10,
  y: 20,
  typeId: 'd1',
  severity: 'high',
  comment: 'скол',
}

describe('умный пользователь: делает всё правильно и по порядку', () => {
  it('инспектор создал -> мастер отремонтировал -> кузов годен', () => {
    const db = createDb()
    const created = db.create(goodDefect, 'inspector')
    expect(created.status).toBe(201)
    const id = created.body.id

    expect(db.update(id, { status: 'in_repair' }, 'master').status).toBe(200)
    expect(db.update(id, { status: 'resolved' }, 'master').status).toBe(200)

    const summary = pdiSummary(db.list('VIN1'))
    expect(summary.fit).toBe(true)
    expect(summary.resolved).toBe(1)
  })

  it('инспектор поправил зону и комментарий у своего дефекта', () => {
    const db = createDb()
    const id = db.create(goodDefect, 'inspector').body.id
    const res = db.update(id, { zone: 'крыло', comment: 'перепутал зону' }, 'inspector')
    expect(res.status).toBe(200)
    expect(res.body.zone).toBe('крыло')
  })
})

describe('обычный пользователь: данные норм, но порядок действий кривой', () => {
  it('меняет статус дефекта которого ещё нет', () => {
    const db = createDb()
    const res = db.update('такого-нет', { status: 'in_repair' }, 'master')
    expect(res.status).toBe(404)
  })

  it('пытается перепрыгнуть через статус: new сразу в resolved', () => {
    const db = createDb()
    const id = db.create(goodDefect, 'inspector').body.id
    const res = db.update(id, { status: 'resolved' }, 'master')
    expect(res.status).toBe(400)
    expect(res.body.errors[0]).toContain('Недопустимый переход')
  })

  it('удаляет один дефект два раза', () => {
    const db = createDb()
    const id = db.create(goodDefect, 'inspector').body.id
    expect(db.remove(id, 'inspector').status).toBe(200)
    expect(db.remove(id, 'inspector').status).toBe(404)
  })

  it('мастер пытается создать дефект - 403', () => {
    const db = createDb()
    const res = db.create(goodDefect, 'master')
    expect(res.status).toBe(403)
    expect(db.list().length).toBe(0)
  })

  it('инспектор пытается перевести статус ремонта - 403', () => {
    const db = createDb()
    const id = db.create(goodDefect, 'inspector').body.id
    const res = db.update(id, { status: 'in_repair' }, 'inspector')
    expect(res.status).toBe(403)
  })

  it('действие вообще без роли - 403', () => {
    const db = createDb()
    expect(db.create(goodDefect).status).toBe(403)
    expect(db.create(goodDefect, 'admin').status).toBe(403)
  })
})

describe('тупой пользователь: null, пробелы и буквы вместо цифр', () => {
  it('zone = null - понятная ошибка, а не падение сервера', () => {
    const db = createDb()
    const res = db.create({ ...goodDefect, zone: null }, 'inspector')
    expect(res.status).toBe(400)
    expect(res.body.errors).toContain('Укажите зону')
  })

  it('zone из одних пробелов - ошибка', () => {
    const db = createDb()
    const res = db.create({ ...goodDefect, zone: '    ' }, 'inspector')
    expect(res.status).toBe(400)
  })

  it('буквы вместо координат - ошибка про числа', () => {
    const db = createDb()
    const res = db.create({ ...goodDefect, x: 'абв', y: 'где' }, 'inspector')
    expect(res.status).toBe(400)
    expect(res.body.errors).toContain('Координаты x и y должны быть числами')
  })

  it('выдуманная серьёзность - ошибка', () => {
    const db = createDb()
    const res = db.create({ ...goodDefect, severity: 'мега плохо' }, 'inspector')
    expect(res.status).toBe(400)
  })

  it('совсем пустое тело запроса - ошибка, не падение', () => {
    const db = createDb()
    expect(db.create(null, 'inspector').status).toBe(400)
    expect(db.create({}, 'inspector').status).toBe(400)
  })

  it('patch без данных - ошибка, не падение', () => {
    const db = createDb()
    const id = db.create(goodDefect, 'inspector').body.id
    expect(db.update(id, null, 'inspector').status).toBe(400)
  })

  it('левые поля в patch не сохраняются', () => {
    const db = createDb()
    const id = db.create(goodDefect, 'inspector').body.id
    const res = db.update(id, { status: 'in_repair', admin: true, id: 'взломал' }, 'master')
    expect(res.status).toBe(200)
    expect(res.body.admin).toBe(undefined)
    expect(res.body.id).toBe(id)
  })

  it('в файле хранилища вместо списка лежит строка - не падаем', () => {
    const file = os.tmpdir() + '/mycar-bad-shape-' + Date.now() + '.json'
    writeFileSync(file, '{"defects": "я не массив"}')
    const db = createDb(file)
    expect(db.list().length).toBe(0)
    unlinkSync(file)
  })
})

describe('злоумышленник: не даём лишнего', () => {
  it('мастер не может поменять зону вместе со статусом', () => {
    const db = createDb()
    const id = db.create(goodDefect, 'inspector').body.id
    const res = db.update(id, { status: 'in_repair', zone: 'взломал' }, 'master')
    expect(res.status).toBe(200)
    expect(res.body.zone).toBe('капот')
    expect(res.body.status).toBe('in_repair')
  })

  it('скрипт в комментарии не выполнится в отчёте PDI', () => {
    const bad = { ...goodDefect, status: 'new', comment: '<script>alert(1)</script>' }
    const html = pdiHtml('VIN1', [bad], [])
    expect(html.includes('<script>alert')).toBe(false)
    expect(html).toContain('&lt;script&gt;')
  })

  it('пробелы по краям зоны обрезаются и при создании и при изменении', () => {
    const db = createDb()
    const created = db.create({ ...goodDefect, zone: '  капот  ' }, 'inspector')
    expect(created.body.zone).toBe('капот')
    const patched = db.update(created.body.id, { zone: '  крыло  ' }, 'inspector')
    expect(patched.body.zone).toBe('крыло')
  })
})
