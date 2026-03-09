// src/app/(auth)/login/page.tsx
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@components/auth/LoginForm'

export const metadata: Metadata = { title: 'Iniciar sesión · VENTO' }

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">VENTO</h1>
          <p className="text-stone-400 text-sm mt-1">Iniciá sesión para continuar</p>
        </div>
        <Suspense fallback={<div className="text-sm text-stone-400">Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
