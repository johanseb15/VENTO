// src/domain/search.ts — búsqueda full-text, FP puro

export type SearchQuery = {
  q: string
  categorySlug?: string
  page: number
  pageSize: number
}

export type SearchResult = {
  id: string
  name: string
  slug: string
  price: number
  stock: number
  images: string[]
  categoryName: string
  relevance?: number
}

/** Sanitiza y normaliza el texto de búsqueda */
export const sanitizeQuery = (raw: string): string =>
  raw
    .trim()
    .replace(/[<>'"%;()&+]/g, '')   // evitar inyecciones
    .slice(0, 100)                   // límite de longitud

/** ¿La query es suficientemente larga para buscar? */
export const isQueryValid = (q: string): boolean =>
  q.trim().length >= 2

/** Construye el where de Prisma para búsqueda full-text */
export const buildSearchWhere = (q: string, categorySlug?: string) => {
  const terms = sanitizeQuery(q)
    .split(/\s+/)
    .filter(t => t.length > 1)

  const textConditions = terms.map(term => ({
    OR: [
      { name:        { contains: term, mode: 'insensitive' as const } },
      { description: { contains: term, mode: 'insensitive' as const } },
    ],
  }))

  return {
    isActive: true,
    AND: [
      ...textConditions,
      ...(categorySlug ? [{ category: { slug: categorySlug } }] : []),
    ],
  }
}

/** Parsea los searchParams de la URL a una SearchQuery tipada */
export const parseSearchParams = (
  params: Record<string, string | string[] | undefined>
): SearchQuery => {
  const get = (k: string) => {
    const v = params[k]
    return Array.isArray(v) ? v[0] : v
  }
  return {
    q:            sanitizeQuery(get('q') ?? ''),
    categorySlug: get('categoria') || undefined,
    page:         Math.max(1, Number(get('pagina') ?? '1')),
    pageSize:     12,
  }
}
