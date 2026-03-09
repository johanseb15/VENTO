'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Email o contrasena incorrectos')
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  const handleGoogle = async () => {
    await signIn('google', { callbackUrl })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-stone-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError(null)
          }}
          placeholder="ana@ejemplo.com"
          autoComplete="email"
          required
          className="rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none transition
                     focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-stone-700">
          Contrasena
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            if (error) setError(null)
          }}
          placeholder="********"
          autoComplete="current-password"
          required
          className="rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none transition
                     focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-xl bg-stone-900 py-3 text-sm font-medium text-white transition
                   hover:bg-stone-800 disabled:opacity-50"
      >
        {loading ? 'Entrando...' : 'Iniciar sesion'}
      </button>

      <button
        type="button"
        onClick={handleGoogle}
        className="w-full rounded-xl border border-stone-300 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
      >
        Continuar con Google
      </button>

      <p className="text-center text-sm">
        <Link href="/forgot-password" className="font-medium text-stone-600 hover:text-stone-900 hover:underline">
          Olvidaste tu contrasena?
        </Link>
      </p>

      <p className="text-center text-sm text-stone-400">
        No tenes cuenta?{' '}
        <Link href="/registro" className="font-medium text-stone-700 hover:underline">
          Registrate
        </Link>
      </p>
    </form>
  )
}
