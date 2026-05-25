import { z } from 'zod'
import { createAdminSession, validateAdminPassword } from '../../../utils/adminAuth'
import { readValidatedBody } from '../../../utils/validation'

const loginSchema = z.object({
  password: z.string().min(1, 'Informe a senha do admin.')
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, loginSchema)

  if (!validateAdminPassword(event, body.password)) {
    throw createError({ statusCode: 401, statusMessage: 'Senha do admin incorreta.' })
  }

  createAdminSession(event)

  return { authenticated: true }
})
