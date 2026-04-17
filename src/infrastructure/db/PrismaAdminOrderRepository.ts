// src/infrastructure/db/PrismaAdminOrderRepository.ts
import prisma from '@lib/prisma'
import type { AdminOrderRepository } from '@application/AdminService'
import type { Prisma } from '@prisma/client'
import { OrderStatus } from '@prisma/client'

export class PrismaAdminOrderRepository implements AdminOrderRepository {
  async findAll(page: number, pageSize: number, status?: string) {
    const skip = (page - 1) * pageSize
    const where: Prisma.OrderWhereInput =
      status ? { status: status as OrderStatus } : {}

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip, take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count({ where }),
    ])

    return {
      orders: orders.map(o => ({
        id: o.id,
        status: o.status,
        total: o.total,
        discount: o.discount,
        createdAt: o.createdAt,
        user: o.user,
        itemCount: o._count.items,
      })),
      total,
    }
  }

  async updateStatus(id: string, status: string) {
    await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    })
  }

  async getStats() {
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      allOrders,
      monthOrders,
      totalProducts,
      pendingOrders,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' }, createdAt: { gte: firstOfMonth } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
    ])

    return {
      totalRevenue:      allOrders._sum.total ?? 0,
      totalOrders:       allOrders._count,
      totalProducts,
      pendingOrders,
      revenueThisMonth:  monthOrders._sum.total ?? 0,
      ordersThisMonth:   monthOrders._count,
      avgOrderValue:
        (allOrders._count ?? 0) > 0
          ? Math.round((allOrders._sum.total ?? 0) / allOrders._count)
          : 0,
    }
  }
}
