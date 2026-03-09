// src/app/(auth)/reset-password/page.tsx
'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token  = params.get('token')

  const [password, setPassword]   = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError]         = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)

  if (!token) {
    return (
      <p className="text-red-600 text-sm text-center">
        Link inválido. Solicitá uno nuevo.
      </p>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== password2) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)

    const res  = await fetch('/api/auth/reset-password', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token, password }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setError(data.error); return }
    setDone(true)
    setTimeout(() => router.push('/login'), 2000)
  }

  if (done) {
    return (
      <div className="text-center">
        <p className="text-green-700 font-medium">¡Contraseña actualizada!</p>
        <p className="text-stone-400 text-sm mt-1">Redirigiendo al login...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {[
        { id: 'pw1', label: 'Nueva contraseña', value: password, onChange: setPassword },
        { id: 'pw2', label: 'Confirmá la contraseña', value: password2, onChange: setPassword2 },
      ].map(({ id, label, value, onChange }) => (
        <div key={id} className="flex flex-col gap-1.5">
          <label htmlFor={id} className="text-sm font-medium text-stone-700">{label}</label>
          <input id={id} type="password" value={value} onChange={e => onChange(e.target.value)}
            placeholder="••••••••" minLength={8} required
            className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none
                       focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition" />
        </div>
      ))}
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <button type="submit" disabled={loading || !password}
        className="w-full bg-stone-900 text-white py-3 rounded-xl text-sm font-medium
                   hover:bg-stone-800 disabled:opacity-50 transition mt-2">
        {loading ? 'Guardando...' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-stone-900">VENTO</h1>
          <p className="text-stone-400 text-sm mt-1">Nueva contraseña</p>
        </div>
        <Suspense>
          <ResetForm />
        </Suspense>
        <Link href="/login"
          className="block text-center text-sm text-stone-400 hover:text-stone-700 transition mt-4">
          ← Volver al login
        </Link>
      </div>
    </div>
  )
}
