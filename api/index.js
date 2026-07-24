import { createApp } from '../server/app.js'

const app = createApp('/tmp/data.json')

export default function handler(req, res) {
  req.url = req.url.replace(/^\/api/, '') || '/'
  return app(req, res)
}
