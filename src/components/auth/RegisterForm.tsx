'use client'
// src/components/auth/RegisterForm.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type FieldErrors = Record<string, string>

type Props = {
  onSuccess?: (user: { email: string }) => void
}

export function RegisterForm({ onSuccess }: Props) {
  const router = useRouter()
  const [fields, setFields] = useState({ email: '', password: '', name: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const update = (field: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFields((f) => ({ ...f, [field]: e.target.value }))
      // Limpia el error del campo al escribir
      setFieldErrors((err) => { const next = { ...err }; delete next[field]; return next })
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors)
        else setApiError(data.error ?? 'Ocurrió un error. Intentá de nuevo.')
        return
      }

      onSuccess ? onSuccess(data.user) : router.push('/dashboard/pedidos')

    } catch {
      setApiError('No se pudo conectar. Revisá tu conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

      {/* Nombre */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-stone-700">
          Nombre <span className="text-stone-400 font-normal">(opcional)</span>
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={fields.name}
          onChange={update('name')}
          placeholder="Ana García"
          className="border border-stone-200 rounded-lg px-4 py-2.5 text-sm outline-none
                     focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition"
        />
        {fieldErrors['name'] && (
          <span className="text-xs text-red-600" role="alert">{fieldErrors['name']}</span>
        )}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-stone-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={fields.email}
          onChange={update('email')}
          placeholder="ana@ejemplo.com"
          aria-describedby={fieldErrors['email'] ? 'email-error' : undefined}
          aria-invalid={!!fieldErrors['email']}
          className="border border-stone-200 rounded-lg px-4 py-2.5 text-sm outline-none
                     focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition
                     aria-[invalid=true]:border-red-400"
        />
        {fieldErrors['email'] && (
          <span id="email-error" className="text-xs text-red-600" role="alert">
            {fieldErrors['email']}
          </span>
        )}
      </div>

      {/* Contraseña */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-stone-700">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={fields.password}
          onChange={update('password')}
          placeholder="Mínimo 8 caracteres"
          aria-describedby={fieldErrors['password'] ? 'password-error' : undefined}
          aria-invalid={!!fieldErrors['password']}
          className="border border-stone-200 rounded-lg px-4 py-2.5 text-sm outline-none
                     focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition
                     aria-[invalid=true]:border-red-400"
        />
        {fieldErrors['password'] && (
          <span id="password-error" className="text-xs text-red-600" role="alert">
            {fieldErrors['password']}
          </span>
        )}
        <span className="text-xs text-stone-400">
          Al menos 8 caracteres, una mayúscula y un número.
        </span>
      </div>

      {/* Error global de API */}
      {apiError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3" role="alert">
          {apiError}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="bg-stone-900 text-white rounded-lg px-4 py-3 text-sm font-medium
                   hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed
                   transition active:scale-[.98]"
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

    </form>
  )
}
