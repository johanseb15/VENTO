import { describe, expect, it } from 'vitest'
import { validateRegisterInput, validateShippingAddress } from '@domain/validation'

describe('validateRegisterInput()', () => {
  const valid = { email: 'ana@vento.com', password: 'Vento123' }

  it('acepta datos validos', () => {
    const result = validateRegisterInput(valid)
    expect(result.success).toBe(true)
  })

  it('normaliza el email a minusculas y sin espacios', () => {
    const result = validateRegisterInput({ ...valid, email: '  ANA@VENTO.COM  ' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe('ana@vento.com')
  })

  it('rechaza email sin arroba', () => {
    const result = validateRegisterInput({ ...valid, email: 'anaventopunto.com' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.errors['email']).toBeDefined()
  })

  it('rechaza email sin dominio', () => {
    const result = validateRegisterInput({ ...valid, email: 'ana@' })
    expect(result.success).toBe(false)
  })

  it('rechaza contrasena menor a 8 caracteres', () => {
    const result = validateRegisterInput({ ...valid, password: 'V1' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.errors['password']).toMatch(/8 caracteres/)
  })

  it('rechaza contrasena sin mayuscula', () => {
    const result = validateRegisterInput({ ...valid, password: 'vento123' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.errors['password']).toMatch(/may/i)
  })

  it('rechaza contrasena sin numero', () => {
    const result = validateRegisterInput({ ...valid, password: 'VentoPass' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.errors['password']).toMatch(/num/i)
  })

  it('rechaza nombre demasiado corto', () => {
    const result = validateRegisterInput({ ...valid, name: 'A' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.errors['name']).toBeDefined()
  })

  it('acepta nombre undefined', () => {
    const result = validateRegisterInput(valid)
    expect(result.success).toBe(true)
  })
})

describe('validateShippingAddress()', () => {
  const validAddr = {
    fullName: 'Ana Garcia',
    street: 'Av. Corrientes 1234',
    city: 'Buenos Aires',
    province: 'CABA',
    postalCode: '1043',
    phone: '+5491155556666',
  }

  it('acepta direccion valida', () => {
    const result = validateShippingAddress(validAddr)
    expect(result.success).toBe(true)
  })

  it('rechaza codigo postal que no tiene 4 digitos', () => {
    const result = validateShippingAddress({ ...validAddr, postalCode: '123' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.errors['postalCode']).toBeDefined()
  })

  it('rechaza nombre demasiado corto', () => {
    const result = validateShippingAddress({ ...validAddr, fullName: 'An' })
    expect(result.success).toBe(false)
  })

  it('rechaza telefono invalido', () => {
    const result = validateShippingAddress({ ...validAddr, phone: '123' })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.errors['phone']).toBeDefined()
  })

  it('devuelve multiples errores a la vez', () => {
    const result = validateShippingAddress({ ...validAddr, fullName: 'A', postalCode: 'XYZ' })
    expect(result.success).toBe(false)
    if (!result.success) expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(2)
  })
})
