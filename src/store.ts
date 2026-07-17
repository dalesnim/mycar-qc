import { ref } from 'vue'
import type { Defect, DefectType, Status } from './type'

const API = 'http://localhost:3000'

export const defects = ref<Defect[]>([])
export const defectTypes = ref<DefectType[]>([])
export const selectedId = ref<string | null>(null)

export function isDraft(d: Defect) {
  return d.id.startsWith('tmp-')
}

export async function loadAll() {
  const [d, t] = await Promise.all([
    fetch(API + '/defects'),
    fetch(API + '/defect-types'),
  ])
  defects.value = await d.json()
  defectTypes.value = await t.json()
}

export async function saveDefect(d: Defect): Promise<string[]> {
  if (isDraft(d)) {
    const res = await fetch(API + '/defects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vin: d.vin,
        zone: d.zone,
        x: d.x,
        y: d.y,
        typeId: d.typeId,
        severity: d.severity,
        comment: d.comment,
      }),
    })
    const data = await res.json()
    if (!res.ok) return data.errors
    const index = defects.value.findIndex((x) => x.id === d.id)
    defects.value[index] = data
    selectedId.value = data.id
    return []
  }
  const res = await fetch(API + '/defects/' + d.id, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      zone: d.zone,
      typeId: d.typeId,
      severity: d.severity,
      comment: d.comment,
    }),
  })
  const data = await res.json()
  if (!res.ok) return data.errors
  return []
}

export async function changeStatus(d: Defect, to: Status): Promise<string[]> {
  const res = await fetch(API + '/defects/' + d.id, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: to }),
  })
  const data = await res.json()
  if (!res.ok) return data.errors
  d.status = data.status
  return []
}

export async function removeDefect(d: Defect) {
  if (!isDraft(d)) {
    await fetch(API + '/defects/' + d.id, { method: 'DELETE' })
  }
  defects.value = defects.value.filter((x) => x.id !== d.id)
  selectedId.value = null
}
