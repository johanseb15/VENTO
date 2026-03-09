import { beforeEach, describe, expect, it, vi } from 'vitest'
import bcrypt from 'bcryptjs'
import { AuthService, type UserRepository } from '@application/AuthService'

const mockUserRepo: UserRepository = {
  findByEmail: vi.fn(),
  create: vi.fn(),
}

const authService = new AuthService(mockUserRepo)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AuthService.register()', () => {
  it('registra un usuario con datos validos', async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null)
    vi.mocked(mockUserRepo.create).mockResolvedValue({
      id: 'cuid_1',
      email: 'ana@vento.com',
      name: 'Ana Garcia',
    })

    const result = await authService.register({
      email: 'ana@vento.com',
      password: 'Vento123',
      name: 'Ana Garcia',
    })

    expect(result.success).toBe(true)
    if (result.success) expect(result.user.email).toBe('ana@vento.com')
  })

  it('hashea la contrasena antes de guardar', async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null)
    vi.mocked(mockUserRepo.create).mockResolvedValue({
      id: 'cuid_1',
      email: 'ana@vento.com',
      name: null,
    })

    await authService.register({ email: 'ana@vento.com', password: 'Vento123' })

    const createCall = vi.mocked(mockUserRepo.create).mock.calls[0]?.[0]
    expect(createCall?.password).not.toBe('Vento123')
    expect(createCall?.password).toMatch(/^\$2[aby]\$/)
  })

  it('rechaza email duplicado sin revelar si existe el usuario', async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue({
      id: 'existing',
      email: 'ana@vento.com',
      password: '$2b$hashed',
      name: null,
      role: 'CUSTOMER',
    })

    const result = await authService.register({ email: 'ana@vento.com', password: 'Vento123' })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/email ya/i)
    expect(mockUserRepo.create).not.toHaveBeenCalled()
  })

  it('devuelve errores de validacion sin llamar al repositorio', async () => {
    const result = await authService.register({ email: 'no-es-un-email', password: 'corta' })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.fieldErrors).toBeDefined()
    expect(mockUserRepo.findByEmail).not.toHaveBeenCalled()
    expect(mockUserRepo.create).not.toHaveBeenCalled()
  })

  it('normaliza el email a minusculas antes de buscar', async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null)
    vi.mocked(mockUserRepo.create).mockResolvedValue({
      id: 'cuid_1',
      email: 'ana@vento.com',
      name: null,
    })

    await authService.register({ email: 'ANA@VENTO.COM', password: 'Vento123' })

    expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('ana@vento.com')
  })
})

describe('AuthService.login()', () => {
  const hashedPassword = bcrypt.hashSync('Vento123', 10)

  it('login exitoso con credenciales correctas', async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue({
      id: 'u1',
      email: 'ana@vento.com',
      password: hashedPassword,
      name: 'Ana',
      role: 'CUSTOMER',
    })

    const result = await authService.login('ana@vento.com', 'Vento123')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.user.email).toBe('ana@vento.com')
      expect(result.user.role).toBe('CUSTOMER')
    }
  })

  it('rechaza contrasena incorrecta con mensaje generico', async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue({
      id: 'u1',
      email: 'ana@vento.com',
      password: hashedPassword,
      name: null,
      role: 'CUSTOMER',
    })

    const result = await authService.login('ana@vento.com', 'WrongPass1')
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/credenciales/i)
  })

  it('rechaza usuario inexistente con el mismo mensaje generico', async () => {
    vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(null)

    const result = await authService.login('noexiste@vento.com', 'Vento123')
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/credenciales/i)
  })

  it('rechaza campos vacios', async () => {
    const result = await authService.login('', '')
    expect(result.success).toBe(false)
    expect(mockUserRepo.findByEmail).not.toHaveBeenCalled()
  })
})
