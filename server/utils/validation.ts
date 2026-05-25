import { createError, readBody, type H3Event } from 'h3'
import { ZodError, type ZodType } from 'zod'

function zodErrorToMessage(error: ZodError) {
  return error.issues
    .map((issue) => issue.message)
    .filter(Boolean)
    .join(' ')
}

export async function readValidatedBody<T>(event: H3Event, schema: ZodType<T>) {
  const body = await readBody(event)
  const result = schema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: zodErrorToMessage(result.error) || 'Revise os campos do formulário.',
      data: {
        issues: result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
      }
    })
  }

  return result.data
}
