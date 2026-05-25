import type { ZodError, ZodType } from 'zod'

export function emitAdminToast(message: string, type: 'error' | 'success' | 'info' = 'error') {
  if (!import.meta.client || !message) return
  window.dispatchEvent(new CustomEvent('edificio-admin-toast', { detail: { message, type } }))
}

export function zodErrorToMessage(error: ZodError) {
  return error.issues
    .map((issue) => issue.message)
    .filter(Boolean)
    .join(' ')
}

export function validateAdminForm<T>(schema: ZodType<T>, value: unknown) {
  const result = schema.safeParse(value)

  if (!result.success) {
    const message = zodErrorToMessage(result.error) || 'Revise os campos do formulário.'
    emitAdminToast(message, 'error')

    return {
      success: false as const,
      message
    }
  }

  return {
    success: true as const,
    data: result.data
  }
}
