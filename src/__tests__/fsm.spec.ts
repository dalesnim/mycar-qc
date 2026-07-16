import { describe, it, expect } from 'vitest'
import { canTransition, transitions } from '../fsm'

describe('canTransition', () => {
  it('new можно перевести в in_repair', () => {
    expect(canTransition('new', 'in_repair')).toBe(true)
  })

  it('new нельзя сразу в resolved', () => {
    expect(canTransition('new', 'resolved')).toBe(false)
  })

  it('из in_repair можно в resolved и rejected', () => {
    expect(canTransition('in_repair', 'resolved')).toBe(true)
    expect(canTransition('in_repair', 'rejected')).toBe(true)
  })

  it('resolved и rejected конечные статусы, из них никуда нелья', () => {
    expect(transitions.resolved).toEqual([])
    expect(transitions.rejected).toEqual([])
    expect(canTransition('resolved', 'new')).toBe(false)
    expect(canTransition('rejected', 'in_repair')).toBe(false)
  })

  it('нельзя перейти в тот же статус', () => {
    expect(canTransition('new', 'new')).toBe(false)
  })
})
