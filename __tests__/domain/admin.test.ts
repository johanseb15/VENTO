// __tests__/domain/admin.test.ts
import { describe, it, expect } from 'vitest'
import { validateProduct, generateSlug, canManageProducts } from '@domain/admin'

describe('validateProduct()', () => {
  const valid = {
    name: 'Remera Vento Classic',
    slug: 'remera-vento-classic',
    description: 'Remera de algodón',
    price: 4500,
    stock: 10,
    images: [],
    categoryId: 'cat-1',
    isActive: true,
  }

  it('valida un producto correcto', () => {
    const result = validateProduct(valid)
    expect(result.valid).toBe(true)
  })

  it('rechaza nombre vacío', () => {
    const result = validateProduct({ ...valid, name: '' })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.errors['name']).toBeDefined()
  })

  it('rechaza nombre menor a 3 caracteres', () => {
    const result = validateProduct({ ...valid, name: 'AB' })
    expect(result.valid).toBe(false)
  })

  it('rechaza slug con mayúsculas', () => {
    const result = validateProduct({ ...valid, slug: 'Remera-Vento' })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.errors['slug']).toBeDefined()
  })

  it('rechaza slug con caracteres especiales', () => {
    const result = validateProduct({ ...valid, slug: 'remera vento!' })
    expect(result.valid).toBe(false)
  })

  it('rechaza precio negativo', () => {
    const result = validateProduct({ ...valid, price: -100 })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.errors['price']).toBeDefined()
  })

  it('acepta precio cero', () => {
    const result = validateProduct({ ...valid, price: 0 })
    expect(result.valid).toBe(true)
  })

  it('rechaza stock negativo', () => {
    const result = validateProduct({ ...valid, stock: -1 })
    expect(result.valid).toBe(false)
  })

  it('rechaza stock decimal', () => {
    const result = validateProduct({ ...valid, stock: 3.5 })
    expect(result.valid).toBe(false)
  })

  it('rechaza categoría vacía', () => {
    const result = validateProduct({ ...valid, categoryId: '' })
    expect(result.valid).toBe(false)
  })

  it('devuelve múltiples errores a la vez', () => {
    const result = validateProduct({ name: '', price: -1, categoryId: '' })
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(Object.keys(result.errors).length).toBeGreaterThan(1)
    }
  })

  it('normaliza el nombre con trim()', () => {
    const result = validateProduct({ ...valid, name: '  Remera  ' })
    expect(result.valid).toBe(true)
    if (result.valid) expect(result.data.name).toBe('Remera')
  })
})

describe('generateSlug()', () => {
  it('convierte a minúsculas y reemplaza espacios con guiones', () => {
    expect(generateSlug('Remera Vento Classic')).toBe('remera-vento-classic')
  })

  it('elimina tildes', () => {
    expect(generateSlug('Pantalón')).toBe('pantalon')
  })

  it('elimina caracteres especiales', () => {
    expect(generateSlug('Remera & Jean')).toBe('remera-jean')
  })

  it('colapsa múltiples espacios', () => {
    expect(generateSlug('Remera   Clásica')).toBe('remera-clasica')
  })
})

describe('canManageProducts()', () => {
  it('permite al ADMIN gestionar productos', () => {
    expect(canManageProducts('ADMIN')).toBe(true)
  })

  it('deniega al USER gestionar productos', () => {
    expect(canManageProducts('USER')).toBe(false)
  })
})
