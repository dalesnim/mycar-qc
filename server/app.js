import express from 'express'
import cors from 'cors'
import { createDb } from './db.js'
import { pdiHtml } from './report.js'
import { log } from './logger.js'
import { findUser } from './users.js'

export function createApp(file) {
  const app = express()
  app.use(cors())
  app.use(express.json())

  const db = createDb(file)

  app.use((req, res, next) => {
    res.on('finish', () => {
      log(req.method + ' ' + req.url + ' -> ' + res.statusCode)
    })
    next()
  })

  app.post('/login', (req, res) => {
    const body = req.body || {}
    const user = findUser(body.login, body.password)
    if (!user) {
      log('неудачный вход: ' + body.login)
      res.status(403).json({ errors: ['Неверный логин или пароль'] })
      return
    }
    log('вошёл ' + user.login + ' (' + user.role + ')')
    res.json({ name: user.name, role: user.role })
  })

  app.get('/defects', (req, res) => {
    res.json(db.list(req.query.vin))
  })

  app.post('/defects', (req, res) => {
    const result = db.create(req.body, req.headers['x-role'])
    res.status(result.status).json(result.body)
  })

  app.patch('/defects/:id', (req, res) => {
    const result = db.update(req.params.id, req.body, req.headers['x-role'])
    res.status(result.status).json(result.body)
  })

  app.delete('/defects/:id', (req, res) => {
    const result = db.remove(req.params.id, req.headers['x-role'])
    res.status(result.status).json(result.body)
  })

  app.get('/defect-types', (req, res) => {
    res.json(db.types())
  })

  app.post('/defect-types', (req, res) => {
    const result = db.addType(req.body, req.headers['x-role'])
    res.status(result.status).json(result.body)
  })

  app.get('/inspections/:vin/pdi-report', (req, res) => {
    res.send(pdiHtml(req.params.vin, db.list(req.params.vin), db.types()))
  })

  app.use((req, res) => {
    res.status(404).json({ errors: ['Нет такого адреса: ' + req.method + ' ' + req.url] })
  })

  app.use((err, req, res, _next) => {
    if (err.type === 'entity.parse.failed') {
      res.status(400).json({ errors: ['Некорректный JSON в запросе'] })
      return
    }
    log('ОШИБКА на ' + req.method + ' ' + req.url + ': ' + err.message)
    res.status(500).json({ errors: ['Что-то пошло не так на сервере'] })
  })

  return app
}
