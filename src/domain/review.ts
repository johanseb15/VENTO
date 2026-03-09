// src/domain/review.ts — reseñas y calificaciones, FP puro

export type ReviewInput = {
  rating: number      // 1-5
  title: string
  body: string
}

export type Review = ReviewInput & {
  id: string
  userId: string
  productId: string
  createdAt: Date
  user: { name: string | null; email: string }
}

export type ReviewStats = {
  average: number     // 0-5, 1 decimal
  count: number
  distribution: Record<1 | 2 | 3 | 4 | 5, number>
}

export type ReviewValidationResult =
  | { valid: true; data: ReviewInput }
  | { valid: false; errors: Record<string, string> }

/** Valida una reseña antes de guardarla */
export const validateReview = (input: Partial<ReviewInput>): ReviewValidationResult => {
  const errors: Record<string, string> = {}

  if (!input.rating || !Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    errors['rating'] = 'La calificación debe ser un número entre 1 y 5'
  }

  if (!input.title?.trim()) {
    errors['title'] = 'El título es requerido'
  } else if (input.title.trim().length < 3) {
    errors['title'] = 'El título debe tener al menos 3 caracteres'
  } else if (input.title.trim().length > 100) {
    errors['title'] = 'El título no puede superar los 100 caracteres'
  }

  if (!input.body?.trim()) {
    errors['body'] = 'El cuerpo de la reseña es requerido'
  } else if (input.body.trim().length < 10) {
    errors['body'] = 'La reseña debe tener al menos 10 caracteres'
  } else if (input.body.trim().length > 1000) {
    errors['body'] = 'La reseña no puede superar los 1000 caracteres'
  }

  if (Object.keys(errors).length > 0) return { valid: false, errors }

  return {
    valid: true,
    data: {
      rating: input.rating!,
      title:  input.title!.trim(),
      body:   input.body!.trim(),
    },
  }
}

/** Calcula estadísticas a partir de un array de reseñas */
export const calcReviewStats = (reviews: { rating: number }[]): ReviewStats => {
  if (reviews.length === 0) {
    return { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
  }

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1|2|3|4|5, number>
  let sum = 0

  for (const r of reviews) {
    sum += r.rating
    distribution[r.rating as 1|2|3|4|5]++
  }

  return {
    average: Math.round((sum / reviews.length) * 10) / 10,
    count:   reviews.length,
    distribution,
  }
}

/** ¿Se puede mostrar la calificación promedio? (mínimo 3 reseñas) */
export const hasEnoughReviews = (count: number): boolean => count >= 3
