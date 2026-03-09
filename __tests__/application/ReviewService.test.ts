// __tests__/application/ReviewService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ReviewService } from '@application/ReviewService'
import type { ReviewRepository } from '@application/ReviewService'

const repo: ReviewRepository = {
  findByProduct:           vi.fn(),
  findByUser:              vi.fn(),
  create:                  vi.fn(),
  hasUserPurchasedProduct: vi.fn(),
}

const sut = new ReviewService(repo)

const validInput = { rating: 5, title: 'Excelente', body: 'Producto de muy buena calidad.' }
const mockReview = { id: 'r1', ...validInput, userId: 'u1', productId: 'p1', createdAt: new Date(), user: { name: 'Ana', email: 'ana@test.com' } }

beforeEach(() => vi.clearAllMocks())

describe('ReviewService.createReview()', () => {
  it('crea reseña cuando el usuario compró el producto y no tiene reseña previa', async () => {
    vi.mocked(repo.hasUserPurchasedProduct).mockResolvedValue(true)
    vi.mocked(repo.findByUser).mockResolvedValue(null)
    vi.mocked(repo.create).mockResolvedValue(mockReview)

    const result = await sut.createReview({ userId: 'u1', productId: 'p1', input: validInput })
    expect(result.success).toBe(true)
    expect(repo.create).toHaveBeenCalledOnce()
  })

  it('rechaza si el usuario no compró el producto', async () => {
    vi.mocked(repo.hasUserPurchasedProduct).mockResolvedValue(false)

    const result = await sut.createReview({ userId: 'u1', productId: 'p1', input: validInput })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/comprado/)
    expect(repo.create).not.toHaveBeenCalled()
  })

  it('rechaza si el usuario ya tiene reseña para ese producto', async () => {
    vi.mocked(repo.hasUserPurchasedProduct).mockResolvedValue(true)
    vi.mocked(repo.findByUser).mockResolvedValue(mockReview)

    const result = await sut.createReview({ userId: 'u1', productId: 'p1', input: validInput })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/ya escribiste/i)
    expect(repo.create).not.toHaveBeenCalled()
  })

  it('rechaza input inválido antes de consultar la DB', async () => {
    const result = await sut.createReview({ userId: 'u1', productId: 'p1', input: { rating: 0, title: '', body: '' } })
    expect(result.success).toBe(false)
    expect(repo.hasUserPurchasedProduct).not.toHaveBeenCalled()
  })
})

describe('ReviewService.getProductReviews()', () => {
  it('devuelve reseñas y estadísticas', async () => {
    vi.mocked(repo.findByProduct).mockResolvedValue([
      { ...mockReview, rating: 5 },
      { ...mockReview, id: 'r2', rating: 3 },
    ])

    const { reviews, stats } = await sut.getProductReviews('p1')
    expect(reviews).toHaveLength(2)
    expect(stats.average).toBe(4.0)
    expect(stats.count).toBe(2)
  })

  it('devuelve stats vacías para producto sin reseñas', async () => {
    vi.mocked(repo.findByProduct).mockResolvedValue([])
    const { stats } = await sut.getProductReviews('p1')
    expect(stats.count).toBe(0)
    expect(stats.average).toBe(0)
  })
})
