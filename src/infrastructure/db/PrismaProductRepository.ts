// src/infrastructure/db/PrismaProductRepository.ts
import prisma from '@lib/prisma'
import type { Prisma } from '@prisma/client'
import type { ProductRepository } from '@application/ProductService'

export class PrismaProductRepository implements ProductRepository {
  async findMany(params: {
    where: Record<string, unknown>
    orderBy: Record<string, string>
    skip: number
    take: number
  }) {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: params.where as Prisma.ProductWhereInput,
        orderBy: params.orderBy as Prisma.ProductOrderByWithRelationInput,
        skip: params.skip,
        take: params.take,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          price: true,
          stock: true,
          images: true,
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where: params.where as Prisma.ProductWhereInput }),
    ])

    return { products, total }
  }

  async findBySlug(slug: string) {
    return prisma.product.findFirst({
      where: { slug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        stock: true,
        images: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    })
  }
}
