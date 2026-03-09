// src/app/api/wishlist/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { WishlistService } from '@application/WishlistService'
import { PrismaWishlistRepository } from '@infrastructure/db/PrismaWishlistRepository'
import { requireAuthAPI } from '@lib/auth-utils'

const wishlistService = new WishlistService(new PrismaWishlistRepository())

export async function GET(_req: NextRequest) {
  const { session, error } = await requireAuthAPI()
  if (error) return error
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const result = await wishlistService.getUserWishlist(userId)
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuthAPI()
  if (error) return error

  const { productId } = await req.json()
  if (!productId) return NextResponse.json({ error: 'productId requerido' }, { status: 400 })

  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  const result = await wishlistService.toggle(userId, productId)
  return NextResponse.json(result)
}
