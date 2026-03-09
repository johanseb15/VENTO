// src/application/ProductService.ts
import { buildProductQuery, buildSortOrder, type ProductFilter, type SortOption } from '@domain/catalog'

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  stock: number
  images: string[]
  category: { id: string; name: string; slug: string }
}

export type ProductListResult = {
  products: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Puerto
export interface ProductRepository {
  findMany(params: {
    where: Record<string, unknown>
    orderBy: Record<string, string>
    skip: number
    take: number
  }): Promise<{ products: Product[]; total: number }>

  findBySlug(slug: string): Promise<Product | null>
}

export class ProductService {
  constructor(private readonly repo: ProductRepository) {}

  async list(
    filter: ProductFilter = {},
    sort: SortOption = 'newest',
    page = 1,
    pageSize = 12
  ): Promise<ProductListResult> {
    const where = buildProductQuery(filter)
    const orderBy = buildSortOrder(sort)
    const skip = (page - 1) * pageSize

    const { products, total } = await this.repo.findMany({
      where, orderBy, skip, take: pageSize,
    })

    return {
      products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async getBySlug(slug: string): Promise<Product | null> {
    return this.repo.findBySlug(slug)
  }
}
