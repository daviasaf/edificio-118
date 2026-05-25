import { createHash, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

const ADMIN_COOKIE = 'edificio_admin_session'

function getRuntimeSecrets(event: H3Event) {
  const config = useRuntimeConfig(event)
  const adminSenha = String(config.adminSenha || '')
  const sessionSecret = String(config.adminSessionSecret || adminSenha || '')

  if (!adminSenha) {
    throw createError({
      statusCode: 500,
      statusMessage: 'ADMIN_SENHA não está configurada no ambiente.'
    })
  }

  return { adminSenha, sessionSecret }
}

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function safeCompare(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)

  if (left.length !== right.length) {
    return false
  }

  return timingSafeEqual(left, right)
}

export function createAdminToken(event: H3Event) {
  const { adminSenha, sessionSecret } = getRuntimeSecrets(event)
  return hash(`${adminSenha}:${sessionSecret}:edificio-118-admin-v2`)
}

export function validateAdminPassword(event: H3Event, password: string) {
  const { adminSenha } = getRuntimeSecrets(event)
  return safeCompare(hash(password), hash(adminSenha))
}

export function createAdminSession(event: H3Event) {
  setCookie(event, ADMIN_COOKIE, createAdminToken(event), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8
  })
}

export function clearAdminSession(event: H3Event) {
  deleteCookie(event, ADMIN_COOKIE, { path: '/' })
}

export function isAdminAuthenticated(event: H3Event) {
  const cookie = getCookie(event, ADMIN_COOKIE)
  if (!cookie) return false
  return safeCompare(cookie, createAdminToken(event))
}

export function requireAdminSession(event: H3Event) {
  if (!isAdminAuthenticated(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Sessão admin inválida ou expirada.' })
  }
}