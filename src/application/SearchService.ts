// src/application/SearchService.ts
import { buildSearchWhere, isQueryValid, type SearchQuery, type SearchResult } from '@domain/search'
import { buildSortOrder } from '@domain/catalog'

export interface SearchRepository {
  search(params: {
    where: Record<string, unknown>
    orderBy: Record<string, string>
    skip: number
    take: number
  }): Promise<{ results: SearchResult[]; total: number }>
}

export class SearchService {
  constructor(private readonly repo: SearchRepository) {}

  async search(query: SearchQuery): Promise<{
    results: SearchResult[]
    total: number
    totalPages: number
    query: SearchQuery
    isValid: boolean
  }> {
    if (!isQueryValid(query.q)) {
      return { results: [], total: 0, totalPages: 0, query, isValid: false }
    }

    const where   = buildSearchWhere(query.q, query.categorySlug)
    const orderBy = buildSortOrder('relevance')
    const skip    = (query.page - 1) * query.pageSize

    const { results, total } = await this.repo.search({
      where, orderBy, skip, take: query.pageSize,
    })

    return {
      results,
      total,
      totalPages: Math.ceil(total / query.pageSize),
      query,
      isValid: true,
    }
  }
}
