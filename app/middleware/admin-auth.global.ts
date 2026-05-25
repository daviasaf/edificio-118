export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin/') || to.path === '/admin') return

  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined

  const response = await $fetch<{ authenticated: boolean }>('/api/admin/auth/me', {
    headers
  }).catch(() => ({ authenticated: false }))

  if (!response.authenticated) {
    return navigateTo('/admin')
  }
})