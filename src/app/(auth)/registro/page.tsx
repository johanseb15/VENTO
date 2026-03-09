// src/app/(auth)/registro/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Crear cuenta',
}

export default function RegistroPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-widest text-stone-900">
            VENTO
          </Link>
          <p className="mt-2 text-sm text-stone-500">Creá tu cuenta para empezar</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm p-8">
          <h1 className="text-lg font-semibold text-stone-900 mb-6">Nueva cuenta</h1>
          <RegisterForm />
        </div>

        {/* Link a login */}
        <p className="text-center mt-6 text-sm text-stone-500">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-stone-900 font-medium hover:underline">
            Iniciá sesión
          </Link>
        </p>

      </div>
    </main>
  )
}
