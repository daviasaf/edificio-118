import { isAdminAuthenticated } from '../../../utils/adminAuth'

export default defineEventHandler((event) => {
  return { authenticated: isAdminAuthenticated(event) }
})