import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createApp } from '../app.js'

let server
let api

beforeAll(() => {
  server = createApp().listen(0)
  api = 'http://localhost:' + server.address().port
})

afterAll(() => {
  server.close()
})

async function req(method, path, body, role) {
  const headers = { 'Content-Type': 'application/json' }
  if (role) headers['x-role'] = role
  const res = await fetch(api + path, {
    method: method,
    headers: headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => null)
  return { status: res.status, data: data }
}

const goodDefect = {
  vin: 'VIN1',
  zone: 'капот',
  x: 10,
  y: 20,
  typeId: 'd1',
  severity: 'high',
  comment: 'скол',
}

describe('флоу через настоящие http запросы', () => {
  it('полный путь пользователя: создать -> в ремонт -> устранить -> отчёт', async () => {
    const created = await req('POST', '/defects', goodDefect, 'inspector')
    expect(created.status).toBe(201)
    const id = created.data.id

    expect((await req('PATCH', '/defects/' + id, { status: 'in_repair' }, 'master')).status).toBe(200)
    expect((await req('PATCH', '/defects/' + id, { status: 'resolved' }, 'master')).status).toBe(200)

    const list = await req('GET', '/defects?vin=VIN1')
    expect(list.data.find((d) => d.id === id).status).toBe('resolved')

    const report = await fetch(api + '/inspections/VIN1/pdi-report')
    expect(report.status).toBe(200)
    expect(await report.text()).toContain('Отчёт PDI')
  })

  it('запрос без роли — 403', async () => {
    const res = await req('POST', '/defects', goodDefect)
    expect(res.status).toBe(403)
  })

  it('мастер создаёт дефект — 403', async () => {
    const res = await req('POST', '/defects', goodDefect, 'master')
    expect(res.status).toBe(403)
  })

  it('битый json в теле — 400 с текстом, а не 500', async () => {
    const res = await fetch(api + '/defects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-role': 'inspector' },
      body: '{это не json',
    })
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.errors[0]).toContain('JSON')
  })

  it('несуществующий адрес — 404 с текстом', async () => {
    const res = await req('GET', '/чего-нет')
    expect(res.status).toBe(404)
    expect(res.data.errors[0]).toContain('Нет такого адреса')
  })

  it('справочник типов отдаётся без роли', async () => {
    const res = await req('GET', '/defect-types')
    expect(res.status).toBe(200)
    expect(res.data.length).toBeGreaterThan(0)
  })

  it('вход с правильным паролем возвращает имя и роль', async () => {
    const res = await req('POST', '/login', { login: 'inspector', password: '1234' })
    expect(res.status).toBe(200)
    expect(res.data.role).toBe('inspector')
    expect(res.data.password).toBe(undefined)
  })

  it('вход с неправильным паролем — 403', async () => {
    const res = await req('POST', '/login', { login: 'inspector', password: 'взлом' })
    expect(res.status).toBe(403)
  })

  it('вход с пустым телом — 403, не падаем', async () => {
    const res = await req('POST', '/login', {})
    expect(res.status).toBe(403)
  })
})
