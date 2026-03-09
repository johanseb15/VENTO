// src/infrastructure/db/PrismaWishlistRepository.ts
import prisma from '@lib/prisma'
import type { WishlistRepository } from '@application/WishlistService'

export class PrismaWishlistRepository implements WishlistRepository {
  async findByUser(userId: string) {
    const items = await prisma.wishlistItem.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      select:  { productId: true, createdAt: true },
    })
    return { items: items.map(i => ({ productId: i.productId, addedAt: i.createdAt })) }
  }

  async addProduct(userId: string, productId: string) {
    await prisma.wishlistItem.upsert({
      where:  { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {},
    })
  }

  async removeProduct(userId: string, productId: string) {
    await prisma.wishlistItem.delete({
      where: { userId_productId: { userId, productId } },
    }).catch(() => {})  // no falla si no existe
  }

  async findProductsDetail(productIds: string[]) {
    return prisma.product.findMany({
      where:  { id: { in: productIds }, isActive: true },
      select: {
        id: true, name: true, slug: true, price: true,
        images: true, stock: true,
        category: { select: { name: true } },
      },
    })
  }
}
