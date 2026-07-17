import express from 'express'
import cors from 'cors'
import { createDb } from './db.js'
import { pdiHtml } from './report.js'

export function createApp(file) {
  const app = express()
  app.use(cors())
  app.use(express.json())

  const db = createDb(file)

  app.get('/defects', (req, res) => {
    res.json(db.list(req.query.vin))
  })

  app.post('/defects', (req, res) => {
    const result = db.create(req.body)
    res.status(result.status).json(result.body)
  })

  app.patch('/defects/:id', (req, res) => {
    const result = db.update(req.params.id, req.body)
    res.status(result.status).json(result.body)
  })

  app.delete('/defects/:id', (req, res) => {
    const result = db.remove(req.params.id)
    res.status(result.status).json(result.body)
  })

  app.get('/defect-types', (req, res) => {
    res.json(db.types())
  })

  app.post('/defect-types', (req, res) => {
    const result = db.addType(req.body)
    res.status(result.status).json(result.body)
  })

  app.get('/inspections/:vin/pdi-report', (req, res) => {
    res.send(pdiHtml(req.params.vin, db.list(req.params.vin), db.types()))
  })

  return app
}
