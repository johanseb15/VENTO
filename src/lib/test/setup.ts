// src/lib/test/setup.ts
import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'

// Limpia todos los mocks después de cada test
afterEach(() => {
  vi.clearAllMocks()
})

// Mock global de next/navigation (necesario para componentes Next.js)
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock global de next/headers
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
  headers: () => new Headers(),
}))
