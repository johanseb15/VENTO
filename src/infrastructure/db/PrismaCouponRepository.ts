import prisma from '@lib/prisma'
import type { CouponRepository } from '@application/OrderService'

export class PrismaCouponRepository implements CouponRepository {
  async findByCode(code: string) {
    const coupon = await prisma.coupon.findUnique({ where: { code } })
    if (!coupon) return null

    return {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minPurchase: coupon.minPurchase,
      maxUses: coupon.maxUses,
      usedCount: coupon.usedCount,
      expiresAt: coupon.expiresAt,
      isActive: coupon.isActive,
    }
  }

  async incrementUsage(couponId: string) {
    await prisma.coupon.update({
      where: { id: couponId },
      data: { usedCount: { increment: 1 } },
    })
  }
}
