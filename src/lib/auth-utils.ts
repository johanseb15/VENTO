// src/lib/auth-utils.ts
// Helpers para usar la sesión en Server Components y API Routes
import { auth } from '@lib/auth'
import { redirect } from 'next/navigation'

/** Obtiene la sesión o redirige al login */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  return session
}

/** Obtiene la sesión o lanza 401 (para API routes) */
export async function requireAuthAPI() {
  const session = await auth()
  if (!session?.user) {
    return { session: null, error: Response.json({ error: 'No autenticado' }, { status: 401 }) }
  }
  return { session, error: null }
}

/** Verifica que el usuario sea ADMIN, sino redirige */
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/')
  return session
}

/** Verifica ADMIN para API routes */
export async function requireAdminAPI() {
  const session = await auth()
  if (!session?.user) {
    return { session: null, error: Response.json({ error: 'No autenticado' }, { status: 401 }) }
  }
  if (session.user.role !== 'ADMIN') {
    return { session: null, error: Response.json({ error: 'Acceso denegado' }, { status: 403 }) }
  }
  return { session, error: null }
}
