// src/app/(auth)/forgot-password/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/auth/forgot-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email }),
    })
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-stone-900">VENTO</h1>
          <p className="text-stone-400 text-sm mt-1">Recuperá tu contraseña</p>
        </div>

        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
            <p className="text-green-800 font-medium">Revisá tu email</p>
            <p className="text-green-600 text-sm mt-1">
              Si el email existe, recibirás las instrucciones en breve.
            </p>
            <Link href="/login"
              className="mt-4 inline-block text-sm text-stone-600 hover:underline">
              Volver al login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-stone-700">Email</label>
              <input id="email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ana@ejemplo.com" required
                className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none
                           focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition" />
            </div>
            <button type="submit" disabled={loading || !email}
              className="w-full bg-stone-900 text-white py-3 rounded-xl text-sm font-medium
                         hover:bg-stone-800 disabled:opacity-50 transition mt-2">
              {loading ? 'Enviando...' : 'Enviar instrucciones'}
            </button>
            <Link href="/login"
              className="text-center text-sm text-stone-400 hover:text-stone-700 transition">
              ← Volver al login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
