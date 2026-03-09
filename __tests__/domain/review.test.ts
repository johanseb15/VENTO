// __tests__/domain/review.test.ts
import { describe, it, expect } from 'vitest'
import { validateReview, calcReviewStats, hasEnoughReviews } from '@domain/review'

const validInput = { rating: 5, title: 'Excelente calidad', body: 'La remera llegó perfecta, muy buen material.' }

describe('validateReview()', () => {
  it('valida una reseña correcta', () => {
    expect(validateReview(validInput).valid).toBe(true)
  })
  it('rechaza rating fuera de rango (0)', () => {
    const r = validateReview({ ...validInput, rating: 0 })
    expect(r.valid).toBe(false)
    if (!r.valid) expect(r.errors['rating']).toBeDefined()
  })
  it('rechaza rating fuera de rango (6)', () => {
    expect(validateReview({ ...validInput, rating: 6 }).valid).toBe(false)
  })
  it('rechaza rating decimal', () => {
    expect(validateReview({ ...validInput, rating: 4.5 }).valid).toBe(false)
  })
  it('rechaza título vacío', () => {
    const r = validateReview({ ...validInput, title: '' })
    expect(r.valid).toBe(false)
    if (!r.valid) expect(r.errors['title']).toBeDefined()
  })
  it('rechaza título mayor a 100 caracteres', () => {
    expect(validateReview({ ...validInput, title: 'a'.repeat(101) }).valid).toBe(false)
  })
  it('rechaza body menor a 10 caracteres', () => {
    expect(validateReview({ ...validInput, body: 'corto' }).valid).toBe(false)
  })
  it('rechaza body mayor a 1000 caracteres', () => {
    expect(validateReview({ ...validInput, body: 'a'.repeat(1001) }).valid).toBe(false)
  })
  it('devuelve múltiples errores', () => {
    const r = validateReview({ rating: 0, title: '', body: '' })
    expect(r.valid).toBe(false)
    if (!r.valid) expect(Object.keys(r.errors).length).toBe(3)
  })
  it('normaliza con trim()', () => {
    const r = validateReview({ ...validInput, title: '  Muy bueno  ', body: '  Llegó en perfectas condiciones  ' })
    if (r.valid) {
      expect(r.data.title).toBe('Muy bueno')
      expect(r.data.body).toBe('Llegó en perfectas condiciones')
    }
  })
})

describe('calcReviewStats()', () => {
  it('calcula promedio correctamente', () => {
    const stats = calcReviewStats([{ rating: 5 }, { rating: 3 }, { rating: 4 }])
    expect(stats.average).toBe(4.0)
    expect(stats.count).toBe(3)
  })
  it('devuelve ceros para array vacío', () => {
    const stats = calcReviewStats([])
    expect(stats.average).toBe(0)
    expect(stats.count).toBe(0)
  })
  it('calcula la distribución correctamente', () => {
    const stats = calcReviewStats([{ rating: 5 }, { rating: 5 }, { rating: 3 }])
    expect(stats.distribution[5]).toBe(2)
    expect(stats.distribution[3]).toBe(1)
    expect(stats.distribution[1]).toBe(0)
  })
  it('redondea a 1 decimal', () => {
    const stats = calcReviewStats([{ rating: 5 }, { rating: 4 }])
    expect(stats.average).toBe(4.5)
  })
})

describe('hasEnoughReviews()', () => {
  it('retorna true con 3+ reseñas', () => {
    expect(hasEnoughReviews(3)).toBe(true)
  })
  it('retorna false con menos de 3', () => {
    expect(hasEnoughReviews(2)).toBe(false)
  })
})
