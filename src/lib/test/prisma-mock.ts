// src/lib/test/prisma-mock.ts
// Mock tipado de Prisma para tests de application/
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended'
import { vi, beforeEach } from 'vitest'

vi.mock('@lib/prisma', () => ({
  default: mockDeep<PrismaClient>(),
}))

// Re-import después del mock
import prisma from '@lib/prisma'

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
