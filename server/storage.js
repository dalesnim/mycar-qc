import fs from 'node:fs'

export function loadData(file) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
    return {
      defects: data.defects || [],
      defectTypes: data.defectTypes || null,
    }
  } catch {
    return { defects: [], defectTypes: null }
  }
}

export function saveData(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}
