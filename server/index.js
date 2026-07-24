import { createApp } from './app.js'
import { log } from './logger.js'

const app = createApp('server/data.json')

app.listen(3000, () => {
  log('API запущен на http://localhost:3000')
})
