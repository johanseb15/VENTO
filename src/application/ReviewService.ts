// src/application/ReviewService.ts
import { validateReview, calcReviewStats, type ReviewInput, type Review, type ReviewStats } from '@domain/review'
export type { Review } from '@domain/review'
export type RatingSummary = ReviewStats

export interface ReviewRepository {
  findByProduct(productId: string): Promise<Review[]>
  findByUser(userId: string, productId: string): Promise<Review | null>
  create(data: ReviewInput & { userId: string; productId: string }): Promise<Review>
  hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean>
}

export type CreateReviewResult =
  | { success: true; review: Review }
  | { success: false; error: string; errors?: Record<string, string> }

export class ReviewService {
  constructor(private readonly repo: ReviewRepository) {}

  async getProductReviews(productId: string): Promise<{
    reviews: Review[]
    stats: ReviewStats
  }> {
    const reviews = await this.repo.findByProduct(productId)
    return { reviews, stats: calcReviewStats(reviews) }
  }

  async createReview(params: {
    userId: string
    productId: string
    input: Partial<ReviewInput>
  }): Promise<CreateReviewResult> {
    const { userId, productId, input } = params

    // 1. Validar datos
    const validation = validateReview(input)
    if (!validation.valid) {
      return { success: false, error: 'Datos inválidos', errors: validation.errors }
    }

    // 2. Solo pueden reseñar quienes compraron el producto
    const hasPurchased = await this.repo.hasUserPurchasedProduct(userId, productId)
    if (!hasPurchased) {
      return { success: false, error: 'Solo podés reseñar productos que hayas comprado' }
    }

    // 3. Un usuario, una reseña por producto
    const existing = await this.repo.findByUser(userId, productId)
    if (existing) {
      return { success: false, error: 'Ya escribiste una reseña para este producto' }
    }

    const review = await this.repo.create({ ...validation.data, userId, productId })
    return { success: true, review }
  }
}
