// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { SearchService } from '@application/SearchService'
import { PrismaSearchRepository } from '@infrastructure/db/PrismaSearchRepository'
import { parseSearchParams } from '@domain/search'

const searchService = new SearchService(new PrismaSearchRepository())

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(new URL(req.url).searchParams)
    const query  = parseSearchParams(params)
    const result = await searchService.search(query)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[GET /api/search]', err)
    return NextResponse.json({ error: 'Error en la búsqueda' }, { status: 500 })
  }
}
