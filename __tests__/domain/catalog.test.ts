// __tests__/domain/catalog.test.ts
import { describe, it, expect } from 'vitest'
import {
  buildProductQuery, buildSortOrder, parseFilterFromParams,
} from '@domain/catalog'

describe('buildProductQuery()', () => {
  it('siempre filtra por isActive: true', () => {
    const query = buildProductQuery({})
    expect(query['isActive']).toBe(true)
  })

  it('agrega filtro de categoría', () => {
    const query = buildProductQuery({ categorySlug: 'remeras' })
    expect(query['category']).toEqual({ slug: 'remeras' })
  })

  it('agrega rango de precio (min y max)', () => {
    const query = buildProductQuery({ minPrice: 1000, maxPrice: 5000 })
    expect(query['price']).toEqual({ gte: 1000, lte: 5000 })
  })

  it('agrega solo precio mínimo si no hay máximo', () => {
    const query = buildProductQuery({ minPrice: 2000 })
    expect(query['price']).toEqual({ gte: 2000 })
  })

  it('filtra por stock disponible', () => {
    const query = buildProductQuery({ inStock: true })
    expect(query['stock']).toEqual({ gt: 0 })
  })

  it('no filtra stock si inStock es false', () => {
    const query = buildProductQuery({ inStock: false })
    expect(query['stock']).toBeUndefined()
  })

  it('agrega búsqueda en nombre y descripción', () => {
    const query = buildProductQuery({ search: 'remera' })
    expect(query['OR']).toBeDefined()
    expect(Array.isArray(query['OR'])).toBe(true)
  })

  it('combina múltiples filtros', () => {
    const query = buildProductQuery({
      categorySlug: 'remeras',
      minPrice: 2000,
      inStock: true,
    })
    expect(query['category']).toBeDefined()
    expect(query['price']).toBeDefined()
    expect(query['stock']).toBeDefined()
  })
})

describe('buildSortOrder()', () => {
  it('price_asc ordena por precio ascendente', () => {
    expect(buildSortOrder('price_asc')).toEqual({ price: 'asc' })
  })

  it('price_desc ordena por precio descendente', () => {
    expect(buildSortOrder('price_desc')).toEqual({ price: 'desc' })
  })

  it('newest ordena por fecha de creación descendente', () => {
    expect(buildSortOrder('newest')).toEqual({ createdAt: 'desc' })
  })
})

describe('parseFilterFromParams()', () => {
  it('parsea categoría desde params', () => {
    const filter = parseFilterFromParams({ categoria: 'remeras' })
    expect(filter.categorySlug).toBe('remeras')
  })

  it('convierte precios de pesos a centavos', () => {
    const filter = parseFilterFromParams({ min: '50', max: '200' })
    expect(filter.minPrice).toBe(5000)
    expect(filter.maxPrice).toBe(20000)
  })

  it('parsea inStock como booleano', () => {
    const filter = parseFilterFromParams({ stock: 'true' })
    expect(filter.inStock).toBe(true)
  })

  it('parsea búsqueda de texto', () => {
    const filter = parseFilterFromParams({ q: 'remera oversize' })
    expect(filter.search).toBe('remera oversize')
  })

  it('devuelve filtro vacío si no hay params', () => {
    const filter = parseFilterFromParams({})
    expect(filter.categorySlug).toBeUndefined()
    expect(filter.minPrice).toBeUndefined()
  })
})
