import { emitAdminToast } from './adminValidation'

export function toErrorMessage(error: unknown, fallback = 'Algo deu ruim. Tenta de novo em instantes.') {
  let message = fallback

  if (typeof error === 'string') {
    message = error
  } else if (error && typeof error === 'object') {
    const record = error as {
      statusMessage?: string
      message?: string
      data?: {
        message?: string
        statusMessage?: string
        statusText?: string
        issues?: Array<{ message?: string }>
      }
    }

    const issues = record.data?.issues?.map((issue) => issue.message).filter(Boolean).join(' ')

    message = (
      issues ||
      record.data?.statusMessage ||
      record.data?.message ||
      record.data?.statusText ||
      record.statusMessage ||
      record.message ||
      fallback
    )
  }

  emitAdminToast(message, 'error')
  return message
}
