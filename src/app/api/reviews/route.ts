// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ReviewService } from '@application/ReviewService'
import { PrismaReviewRepository } from '@infrastructure/db/PrismaReviewRepository'
import { requireAuthAPI } from '@lib/auth-utils'

const reviewService = new ReviewService(new PrismaReviewRepository())

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuthAPI()
  if (error) return error

  const { productId, ...input } = await req.json()
  if (!productId) return NextResponse.json({ error: 'productId requerido' }, { status: 400 })
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const result = await reviewService.createReview({
    userId,
    productId,
    input,
  })

  if (!result.success) {
    return NextResponse.json(
      { error: result.error, errors: result.errors },
      { status: 400 }
    )
  }

  return NextResponse.json(result.review, { status: 201 })
}
