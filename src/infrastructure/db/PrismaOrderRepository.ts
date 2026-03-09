// src/infrastructure/db/PrismaOrderRepository.ts
import prisma from '@lib/prisma'
import type { Prisma } from '@prisma/client'
import type { OrderRepository } from '@application/OrderService'
import type { ShippingAddress } from '@domain/validation'

export class PrismaOrderRepository implements OrderRepository {
  async create(data: Parameters<OrderRepository['create']>[0]) {
    const order = await prisma.order.create({
      data: {
        userId: data.userId,
        subtotal: data.subtotal,
        discount: data.discount,
        total: data.total,
        couponId: data.couponId,
        shippingAddress: data.shippingAddress,
        stripePaymentId: data.stripePaymentId,
        items: {
          create: data.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
      select: { id: true },
    })
    return order
  }

  async findByUser(userId: string) {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    })

    return orders.map(o => ({
      id: o.id,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
      itemCount: o._count.items,
    }))
  }

  async findById(id: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: { id, userId },
      select: {
        id: true, status: true, subtotal: true,
        discount: true, total: true,
        shippingAddress: true, createdAt: true,
        items: {
          select: {
            quantity: true, price: true,
            product: { select: { name: true } },
          },
        },
      },
    })

    if (!order) return null

    return {
      id: order.id,
      status: order.status,
      subtotal: order.subtotal,
      discount: order.discount,
      total: order.total,
      shippingAddress: order.shippingAddress as Prisma.JsonObject as ShippingAddress,
      createdAt: order.createdAt,
      items: order.items.map(i => ({
        productName: i.product.name,
        quantity: i.quantity,
        price: i.price,
      })),
    }
  }
}
