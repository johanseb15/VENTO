// src/infrastructure/db/PrismaStockRepository.ts
import prisma from '@lib/prisma'
import type { StockRepository } from '@application/OrderService'

export class PrismaStockRepository implements StockRepository {
  async getStock(productIds: string[]) {
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, stock: true },
    })
    return products.map(p => ({ productId: p.id, stock: p.stock }))
  }

  async deductStock(items: { productId: string; quantity: number }[]) {
    // Transacción atómica — todos o ninguno
    await prisma.$transaction(
      items.map(item =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    )
  }
}
