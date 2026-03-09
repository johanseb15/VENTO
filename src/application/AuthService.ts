// src/application/AuthService.ts
// Caso de uso de autenticación — OOP con inyección de dependencias
import bcrypt from 'bcryptjs'
import { validateRegisterInput, type RegisterInput } from '@domain/validation'

// Puerto (interfaz) — la capa de aplicación no conoce Prisma directamente
export interface UserRepository {
  findByEmail(email: string): Promise<{
    id: string
    email: string
    password: string | null
    name: string | null
    role: string
  } | null>
  create(data: {
    email: string
    password: string
    name?: string
  }): Promise<{ id: string; email: string; name: string | null }>
}

export type RegisterResult =
  | { success: true; user: { id: string; email: string; name: string | null } }
  | { success: false; error: string; fieldErrors?: Record<string, string> }

export type LoginResult =
  | { success: true; user: { id: string; email: string; name: string | null; role: string } }
  | { success: false; error: string }

export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  async register(input: RegisterInput): Promise<RegisterResult> {
    // 1. Validar con lógica de dominio pura
    const validation = validateRegisterInput(input)
    if (!validation.success) {
      return {
        success: false,
        error: 'Datos inválidos',
        fieldErrors: validation.errors,
      }
    }

    // 2. Verificar unicidad del email
    const existing = await this.userRepo.findByEmail(validation.data.email)
    if (existing) {
      return { success: false, error: 'El email ya está registrado' }
    }

    // 3. Hashear contraseña
    const hashedPassword = await bcrypt.hash(validation.data.password, 10)

    // 4. Persistir
    const user = await this.userRepo.create({
      email: validation.data.email,
      password: hashedPassword,
      name: validation.data.name,
    })

    return { success: true, user }
  }

  async login(email: string, password: string): Promise<LoginResult> {
    if (!email || !password) {
      return { success: false, error: 'Email y contraseña son requeridos' }
    }

    const user = await this.userRepo.findByEmail(email.toLowerCase().trim())
    if (!user || !user.password) {
      return { success: false, error: 'Credenciales inválidas' }
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return { success: false, error: 'Credenciales inválidas' }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    }
  }
}
