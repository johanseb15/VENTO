const LOCAL_PLACEHOLDER = '/images/product-placeholder.svg'

export const resolveProductImage = (image?: string | null): string => {
  if (!image) return LOCAL_PLACEHOLDER
  if (image.startsWith('/')) return image

  try {
    const url = new URL(image)
    if (url.hostname === 'via.placeholder.com') return LOCAL_PLACEHOLDER
    if (url.protocol === 'http:' || url.protocol === 'https:') return image
    return LOCAL_PLACEHOLDER
  } catch {
    return LOCAL_PLACEHOLDER
  }
}
