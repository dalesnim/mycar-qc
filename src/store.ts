import { ref, computed, watch } from 'vue'
import type { Defect, DefectType, Status, ChecklistItem } from './type'

const API = 'http://localhost:3000'

export interface User {
  name: string
  role: 'inspector' | 'master'
}

export const defects = ref<Defect[]>([])
export const defectTypes = ref<DefectType[]>([])
export const selectedId = ref<string | null>(null)
export const apiError = ref('')
export const draft = ref<Defect | null>(null)
export const checklist = ref<ChecklistItem[]>([])

function savedUser(): User | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const user = ref<User | null>(savedUser())

export const role = computed(() => (user.value ? user.value.role : ''))

export async function login(loginName: string, password: string): Promise<string[]> {
  try {
    const res = await fetch(API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: loginName, password: password }),
    })
    const data = await res.json()
    if (!res.ok) return data.errors
    user.value = data
    localStorage.setItem('user', JSON.stringify(data))
    return []
  } catch {
    return noServer
  }
}

export function logout() {
  user.value = null
  draft.value = null
  selectedId.value = null
  localStorage.removeItem('user')
}

const noServer = ['Сервер не отвечает, проверь что он запущен (npm run server)']

watch(selectedId, (id) => {
  if (id) draft.value = null
})

function headers() {
  return { 'Content-Type': 'application/json', 'x-role': role.value }
}

export function startDraft(x: number, y: number) {
  selectedId.value = null
  draft.value = {
    id: 'new',
    vin: 'VIN1',
    x: x,
    y: y,
    zone: '',
    typeId: '',
    severity: 'low',
    status: 'new',
    comment: '',
  }
}

export async function loadAll() {
  try {
    const [d, t, c] = await Promise.all([
      fetch(API + '/defects'),
      fetch(API + '/defect-types'),
      fetch(API + '/inspections/VIN1/checklist'),
    ])
    defects.value = await d.json()
    defectTypes.value = await t.json()
    checklist.value = await c.json()
    apiError.value = ''
  } catch {
    apiError.value = 'Сервер не отвечает. Запусти его командой npm run server и обнови страницу'
  }
}


export async function saveDefect(d: Defect): Promise<string[]> {
  try {
    if (d.id === 'new') {
      const res = await fetch(API + '/defects', {
        method: 'POST',
        headers: headers(),
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
      defects.value.push(data)
      draft.value = null
      selectedId.value = data.id
      return []
    }
    const res = await fetch(API + '/defects/' + d.id, {
      method: 'PATCH',
      headers: headers(),
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
  } catch {
    return noServer
  }
}

export async function changeStatus(d: Defect, to: Status): Promise<string[]> {
  try {
    const res = await fetch(API + '/defects/' + d.id, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ status: to }),
    })
    const data = await res.json()
    if (!res.ok) return data.errors
    d.status = data.status
    return []
  } catch {
    return noServer
  }
}

export async function saveChecklist(): Promise<string[]> {
  try {
    const res = await fetch(API + '/inspections/VIN1/checklist', {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(checklist.value.filter((c) => c.result !== '')),
    })
    const data = await res.json()
    if (!res.ok) return data.errors
    checklist.value = data
    return []
  } catch {
    return noServer
  }
}

export async function removeDefect(d: Defect): Promise<string[]> {
  if (d.id === 'new') {
    draft.value = null
    return []
  }
  try {
    const res = await fetch(API + '/defects/' + d.id, {
      method: 'DELETE',
      headers: headers(),
    })
    if (!res.ok) {
      const data = await res.json()
      return data.errors
    }
    defects.value = defects.value.filter((x) => x.id !== d.id)
    selectedId.value = null
    return []
  } catch {
    return noServer
  }
}
