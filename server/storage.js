import fs from 'node:fs'
import { log } from './logger.js'

export function loadData(file) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
    return {
      defects: Array.isArray(data.defects) ? data.defects : [],
      defectTypes: Array.isArray(data.defectTypes) ? data.defectTypes : null,
    }
  } catch (e) {
    log('не получилось прочитать ' + file + ': ' + e.message + ' (начинаю с пустого списка)')
    return { defects: [], defectTypes: null }
  }
}

export function saveData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}
