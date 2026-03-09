// src/domain/catalog.ts
// Lógica de filtrado del catálogo — funciones puras

export type ProductFilter = {
  categorySlug?: string
  minPrice?: number    // centavos
  maxPrice?: number    // centavos
  inStock?: boolean
  search?: string
}

export type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'relevance'

export type CatalogProduct = {
  id: string
  name: string
  slug: string
  price: number
  stock: number
  categorySlug: string
  createdAt: Date
}

/** Construye los parámetros de query para la DB a partir de los filtros UI */
export const buildProductQuery = (filter: ProductFilter) => {
  const where: Record<string, unknown> = { isActive: true }

  if (filter.categorySlug) {
    where['category'] = { slug: filter.categorySlug }
  }

  if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
    where['price'] = {
      ...(filter.minPrice !== undefined && { gte: filter.minPrice }),
      ...(filter.maxPrice !== undefined && { lte: filter.maxPrice }),
    }
  }

  if (filter.inStock) {
    where['stock'] = { gt: 0 }
  }

  if (filter.search) {
    where['OR'] = [
      { name: { contains: filter.search, mode: 'insensitive' } },
      { description: { contains: filter.search, mode: 'insensitive' } },
    ]
  }

  return where
}

/** Construye el orderBy de Prisma según la opción de ordenamiento */
export const buildSortOrder = (sort: SortOption) => {
  const orders: Record<SortOption, Record<string, string>> = {
    price_asc:  { price: 'asc' },
    price_desc: { price: 'desc' },
    newest:     { createdAt: 'desc' },
    relevance:  { createdAt: 'desc' },
  }
  return orders[sort]
}

/** Parsea los searchParams de la URL a un filtro tipado */
export const parseFilterFromParams = (
  params: Record<string, string | string[] | undefined>
): ProductFilter => {
  const get = (key: string) => {
    const v = params[key]
    return Array.isArray(v) ? v[0] : v
  }

  return {
    categorySlug: get('categoria') || undefined,
    minPrice: get('min') ? Number(get('min')) * 100 : undefined,
    maxPrice: get('max') ? Number(get('max')) * 100 : undefined,
    inStock: get('stock') === 'true',
    search: get('q') || undefined,
  }
}
