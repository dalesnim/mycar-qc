import fs from 'node:fs'

const logFile = 'server/server.log'

export function log(message) {
  if (process.env.VITEST) return
  const line = new Date().toISOString() + ' ' + message
  console.log(line)
  try {
    fs.appendFileSync(logFile, line + '\n')
  } catch (e) {
    console.log('не получилось записать в лог файл: ' + e.message)
  }
}
