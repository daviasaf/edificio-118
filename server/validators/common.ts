import { z } from 'zod'

export const objectIdRegex = /^[a-f\d]{24}$/i

export const objectIdSchema = z
  .string()
  .trim()
  .regex(objectIdRegex, 'ID inválido.')

export const emptyToNull = (value: unknown) => {
  if (value === '' || value === undefined || value === null) return null
  return value
}

export const optionalObjectIdSchema = z.preprocess(emptyToNull, objectIdSchema.nullable())
