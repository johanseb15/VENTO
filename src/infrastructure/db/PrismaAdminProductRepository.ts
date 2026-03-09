// src/infrastructure/db/PrismaAdminProductRepository.ts
import prisma from '@lib/prisma'
import type { AdminProductRepository } from '@application/AdminService'
import type { ProductInput } from '@domain/admin'

export class PrismaAdminProductRepository implements AdminProductRepository {
  async findAll(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip, take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { id: true, name: true } } },
      }),
      prisma.product.count(),
    ])
    return { products, total }
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true } } },
    })
  }

  async create(data: ProductInput) {
    const { categoryId, ...rest } = data
    const product = await prisma.product.create({
      data: { ...rest, category: { connect: { id: categoryId } } },
      select: { id: true },
    })
    return product
  }

  async update(id: string, data: Partial<ProductInput>) {
    const { categoryId, ...rest } = data
    await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
      },
    })
  }

  async delete(id: string) {
    await prisma.product.update({
      where: { id },
      data: { isActive: false },  // soft delete
    })
  }

  async isSlugTaken(slug: string, excludeId?: string) {
    const product = await prisma.product.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
    return !!product
  }
}
