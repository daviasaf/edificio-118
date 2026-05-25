import { requireAdminSession } from '../../../utils/adminAuth'
import { saveProductImages } from '../../../utils/upload'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const uploaded = await saveProductImages(event)

  return {
    images: uploaded.map((item) => item.url),
    uploaded
  }
})
