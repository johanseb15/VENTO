// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@application/ProductService'
import { PrismaProductRepository } from '@infrastructure/db/PrismaProductRepository'
import { parseFilterFromParams } from '@domain/catalog'
import type { SortOption } from '@domain/catalog'

const productService = new ProductService(new PrismaProductRepository())

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const params = Object.fromEntries(searchParams.entries())

    const filter = parseFilterFromParams(params)
    const sort = (params['sort'] ?? 'newest') as SortOption
    const page = Math.max(1, Number(params['pagina'] ?? '1'))

    const result = await productService.list(filter, sort, page)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[GET /api/products]', error)
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}
