const MAX_WIDTH = 1600
const MAX_HEIGHT = 1200
const QUALITY = 0.75
const MAX_SIZE_BYTES = 500 * 1024 // 500KB target

export async function compressImage(file: File): Promise<File> {
  // Skip non-image files
  if (!file.type.startsWith('image/')) return file

  // Skip already small files
  if (file.size <= MAX_SIZE_BYTES) return file

  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img

      // Scale down if needed
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(file) // fallback to original
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Try WebP first, fall back to JPEG
      const tryFormat = (format: string, quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file)
              return
            }
            const ext = format === 'image/webp' ? 'webp' : 'jpg'
            const compressed = new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), {
              type: format,
              lastModified: Date.now(),
            })
            resolve(compressed)
          },
          format,
          quality
        )
      }

      // Check if browser supports WebP encoding
      canvas.toBlob(
        (testBlob) => {
          if (testBlob && testBlob.type === 'image/webp') {
            tryFormat('image/webp', QUALITY)
          } else {
            tryFormat('image/jpeg', QUALITY)
          }
        },
        'image/webp',
        QUALITY
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file) // fallback to original
    }

    img.src = url
  })
}
