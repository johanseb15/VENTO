// src/infrastructure/db/PrismaSearchRepository.ts
import prisma from '@lib/prisma'
import type { Prisma } from '@prisma/client'
import type { SearchRepository } from '@application/SearchService'

export class PrismaSearchRepository implements SearchRepository {
  async search(params: {
    where: Record<string, unknown>
    orderBy: Record<string, string>
    skip: number
    take: number
  }) {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where:   params.where as Prisma.ProductWhereInput,
        orderBy: params.orderBy as Prisma.ProductOrderByWithRelationInput,
        skip:    params.skip,
        take:    params.take,
        select: {
          id: true, name: true, slug: true, price: true, stock: true, images: true,
          category: { select: { name: true } },
        },
      }),
      prisma.product.count({ where: params.where as Prisma.ProductWhereInput }),
    ])
    return {
      results: products.map(p => ({ ...p, categoryName: p.category.name })),
      total,
    }
  }
}
