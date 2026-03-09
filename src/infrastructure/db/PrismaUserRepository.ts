// src/infrastructure/db/PrismaUserRepository.ts
// Adaptador: implementa el puerto UserRepository usando Prisma
import prisma from '@lib/prisma'
import type { UserRepository } from '@application/AuthService'

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
      },
    })
  }

  async create(data: { email: string; password: string; name?: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })
  }
}
