import { describe, it, expect } from 'vitest'
import { countByStatus } from '../summary'
import type { Defect, Status } from '../type'

function makeDefect(status: Status): Defect {
  return {
    id: Math.random().toString(),
    vin: 'TEST123',
    zone: 'капот',
    x: 0,
    y: 0,
    typeId: 'd1',
    severity: 'low',
    status: status,
  }
}

describe('countByStatus', () => {
  it('пустой список - все нули', () => {
    expect(countByStatus([])).toEqual({
      new: 0,
      in_repair: 0,
      resolved: 0,
      rejected: 0,
    })
  })

  it('считает дефекты по статусам', () => {
    const defects = [
      makeDefect('new'),
      makeDefect('new'),
      makeDefect('in_repair'),
      makeDefect('resolved'),
    ]
    const counts = countByStatus(defects)
    expect(counts.new).toBe(2)
    expect(counts.in_repair).toBe(1)
    expect(counts.resolved).toBe(1)
    expect(counts.rejected).toBe(0)
  })
})
