// src/infrastructure/db/PrismaReviewRepository.ts
import prisma from '@lib/prisma'
import type { ReviewRepository } from '@application/ReviewService'
import type { ReviewInput } from '@domain/review'

export class PrismaReviewRepository implements ReviewRepository {
  async findByProduct(productId: string) {
    return prisma.review.findMany({
      where:   { productId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    })
  }

  async findByUser(userId: string, productId: string) {
    return prisma.review.findFirst({
      where: { userId, productId },
      include: { user: { select: { name: true, email: true } } },
    })
  }

  async create(data: ReviewInput & { userId: string; productId: string }) {
    return prisma.review.create({
      data,
      include: { user: { select: { name: true, email: true } } },
    })
  }

  async hasUserPurchasedProduct(userId: string, productId: string) {
    const order = await prisma.order.findFirst({
      where: {
        userId,
        status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
        items:  { some: { productId } },
      },
      select: { id: true },
    })
    return !!order
  }
}
