// src/app/api/coupons/validate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateCoupon } from '@domain/coupon'
import prisma from '@lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json()

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: String(code).toUpperCase() },
    })

    if (!coupon) {
      return NextResponse.json({ error: 'El cupón no existe' }, { status: 404 })
    }

    const result = validateCoupon(
      {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minPurchase: coupon.minPurchase,
        maxUses: coupon.maxUses,
        usedCount: coupon.usedCount,
        expiresAt: coupon.expiresAt,
        isActive: coupon.isActive,
      },
      subtotal
    )

    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ discountAmount: result.discountAmount })

  } catch (error) {
    console.error('[POST /api/coupons/validate]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
