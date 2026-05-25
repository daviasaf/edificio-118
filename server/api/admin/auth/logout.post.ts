import { clearAdminSession } from '../../../utils/adminAuth'

export default defineEventHandler((event) => {
  clearAdminSession(event)
  return { authenticated: false }
})