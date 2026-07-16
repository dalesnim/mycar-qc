import type { Defect } from './type'

export function validateDefect(d: Defect): string[] {
  const errors: string[] = []
  if (d.typeId === '') errors.push('Выберите тип дефекта')
  if (d.zone.trim() === '') errors.push('Укажите зону')
  return errors
}
