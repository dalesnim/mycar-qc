import { createApp } from './app.js'

const app = createApp('server/data.json')

app.listen(3000, () => {
  console.log('API запущен на http://localhost:3000')
})
