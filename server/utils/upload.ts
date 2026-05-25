import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import type { H3Event } from 'h3'

const allowedMimes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
// Upload via server function no Vercel tem limite baixo; manter abaixo de 4.5MB evita erro genérico.
const maxSize = 4.5 * 1024 * 1024

function shouldUseBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

function runningOnVercel() {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV)
}

async function persistImage(buffer: Buffer, folder: string, filename: string) {
  const blobPath = `uploads/${folder}/${filename}`

  if (shouldUseBlobStorage()) {
    const blob = await put(blobPath, buffer, {
      access: 'public',
      contentType: 'image/webp',
      cacheControlMaxAge: 60 * 60 * 24 * 365
    })

    return blob.url
  }

  if (runningOnVercel()) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configure BLOB_READ_WRITE_TOKEN no Vercel para salvar imagens em produção.'
    })
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads', folder)
  await mkdir(uploadDir, { recursive: true })
  await writeFile(join(uploadDir, filename), buffer)

  return `/uploads/${folder}/${filename}`
}

export async function saveImages(event: H3Event, folder = 'products') {
  const parts = await readMultipartFormData(event)

  if (!parts?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhum arquivo enviado.' })
  }

  const files = parts.filter((part) => part.filename && part.data?.length)

  if (!files.length) {
    throw createError({ statusCode: 400, statusMessage: 'Envie pelo menos uma imagem válida.' })
  }

  const uploaded: Array<{ url: string; filename: string; size: number; storage: 'blob' | 'local' }> = []

  for (const file of files) {
    const mime = String(file.type || '').toLowerCase()

    if (!allowedMimes.has(mime)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Arquivo inválido: ${file.filename}. Use jpg, jpeg, png ou webp.`
      })
    }

    if (file.data.length > maxSize) {
      throw createError({
        statusCode: 400,
        statusMessage: `Imagem muito grande: ${file.filename}. Limite de 4.5MB por imagem.`
      })
    }

    const filename = `${Date.now()}-${randomUUID()}.webp`
    const optimizedBuffer = await sharp(file.data)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 84, effort: 4 })
      .toBuffer()

    const url = await persistImage(optimizedBuffer, folder, filename)

    uploaded.push({
      url,
      filename,
      size: file.data.length,
      storage: shouldUseBlobStorage() ? 'blob' : 'local'
    })
  }

  return uploaded
}

export async function saveProductImages(event: H3Event) {
  return saveImages(event, 'products')
}
