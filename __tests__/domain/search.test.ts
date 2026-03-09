// __tests__/domain/search.test.ts
import { describe, it, expect } from 'vitest'
import { sanitizeQuery, isQueryValid, buildSearchWhere, parseSearchParams } from '@domain/search'

describe('sanitizeQuery()', () => {
  it('elimina espacios al inicio y al final', () => {
    expect(sanitizeQuery('  remera  ')).toBe('remera')
  })
  it('elimina caracteres peligrosos', () => {
    expect(sanitizeQuery('<script>alert(1)</script>')).toBe('scriptalert1/script')
  })
  it('trunca a 100 caracteres', () => {
    expect(sanitizeQuery('a'.repeat(150))).toHaveLength(100)
  })
})

describe('isQueryValid()', () => {
  it('acepta queries de 2+ caracteres', () => {
    expect(isQueryValid('re')).toBe(true)
  })
  it('rechaza queries de 1 carácter', () => {
    expect(isQueryValid('r')).toBe(false)
  })
  it('rechaza query vacía', () => {
    expect(isQueryValid('')).toBe(false)
  })
  it('rechaza query con solo espacios', () => {
    expect(isQueryValid('   ')).toBe(false)
  })
})

describe('buildSearchWhere()', () => {
  it('incluye isActive: true siempre', () => {
    const where = buildSearchWhere('remera')
    expect(where.isActive).toBe(true)
  })
  it('genera condiciones para cada término', () => {
    const where = buildSearchWhere('remera oversize')
    // 2 términos → 2 condiciones en AND
    expect(where.AND.length).toBeGreaterThanOrEqual(2)
  })
  it('agrega filtro de categoría cuando se provee', () => {
    const where = buildSearchWhere('remera', 'remeras')
    const hasCategory = where.AND.some(
      (c: any) => c.category?.slug === 'remeras'
    )
    expect(hasCategory).toBe(true)
  })
  it('filtra términos de 1 carácter', () => {
    const where = buildSearchWhere('a remera')
    // "a" se filtra, solo queda "remera"
    expect(where.AND.length).toBe(1)
  })
})

describe('parseSearchParams()', () => {
  it('parsea q, categoria y pagina', () => {
    const result = parseSearchParams({ q: 'remera', categoria: 'tops', pagina: '3' })
    expect(result.q).toBe('remera')
    expect(result.categorySlug).toBe('tops')
    expect(result.page).toBe(3)
  })
  it('página mínima es 1', () => {
    const result = parseSearchParams({ q: 'test', pagina: '0' })
    expect(result.page).toBe(1)
  })
  it('q vacío devuelve string vacío', () => {
    const result = parseSearchParams({})
    expect(result.q).toBe('')
  })
})
