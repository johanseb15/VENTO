// src/lib/auth.ts
// Auth.js v5 — configuración central
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import type { Role } from '@prisma/client'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@lib/prisma'
import { AuthService } from '@application/AuthService'
import { PrismaUserRepository } from '@infrastructure/db/PrismaUserRepository'

const authService = new AuthService(new PrismaUserRepository())

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  providers: [
    Credentials({
      name: 'Credenciales',
      credentials: {
        email:    { label: 'Email',      type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const result = await authService.login(
          String(credentials.email),
          String(credentials.password)
        )
        if (!result.success) return null
        return {
          id:    result.user.id,
          email: result.user.email,
          name:  result.user.name,
          role:  result.user.role as Role,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as Role) ?? 'CUSTOMER'
      }
      return session
    },
  },
})
