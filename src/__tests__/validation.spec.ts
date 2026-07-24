import { describe, it, expect } from 'vitest'
import { validateDefect } from '../validation'
import type { Defect } from '../type'

function makeDefect(zone: string, typeId: string): Defect {
  return {
    id: '1',
    vin: 'TEST123',
    zone: zone,
    x: 10,
    y: 20,
    typeId: typeId,
    severity: 'low',
    status: 'new',
  }
}

describe('validateDefect', () => {
  it('валидный дефект - ошибок нет', () => {
    expect(validateDefect(makeDefect('капот', 'scratch'))).toEqual([])
  })

  it('без типа - ошибка про тип', () => {
    const errors = validateDefect(makeDefect('капот', ''))
    expect(errors).toContain('Выберите тип дефекта')
  })

  it('без зоны - ошибка про зону', () => {
    const errors = validateDefect(makeDefect('', 'scratch'))
    expect(errors).toContain('Укажите зону')
  })

  it('пустой дефект - сразу две ошибки', () => {
    expect(validateDefect(makeDefect('', '')).length).toBe(2)
  })

  it('зона из одних пробелов не считается заполненной', () => {
    const errors = validateDefect(makeDefect('   ', 'scratch'))
    expect(errors).toContain('Укажите зону')
  })
})
