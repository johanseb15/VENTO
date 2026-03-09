'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

type Category = { id: string; name: string; slug: string }

type Props = {
  categories: Category[]
}

export function ProductFilters({ categories }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('pagina')
      router.push(`${pathname}?${next.toString()}`)
    },
    [params, pathname, router]
  )

  const active = (key: string, value: string) => params.get(key) === value

  return (
    <aside className="flex flex-col gap-6">
      <div className="bento-card border-none bg-brand-mint/25">
        <h3 className="mb-4 font-serif text-xl text-text-main">Categorias</h3>
        <ul className="flex flex-col gap-2">
          <li>
            <button
              onClick={() => updateParam('categoria', null)}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm transition
                ${
                  !params.get('categoria')
                    ? 'bg-text-main font-semibold text-white'
                    : 'text-slate-600 hover:bg-white/80'
                }`}
            >
              Todo
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => updateParam('categoria', cat.slug)}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition
                  ${
                    active('categoria', cat.slug)
                      ? 'bg-text-main font-semibold text-white'
                      : 'text-slate-600 hover:bg-white/80'
                  }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="bento-card">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Precio</h3>
        <div className="flex flex-col gap-2">
          {[
            { label: 'Hasta $5.000', min: null, max: '5000' },
            { label: '$5.000 - $10.000', min: '5000', max: '10000' },
            { label: '$10.000 - $20.000', min: '10000', max: '20000' },
            { label: '+$20.000', min: '20000', max: null },
          ].map(({ label, min, max }) => {
            const isActive = params.get('min') === (min ?? '') && params.get('max') === (max ?? '')
            return (
              <button
                key={label}
                onClick={() => {
                  const next = new URLSearchParams(params.toString())
                  if (min) next.set('min', min)
                  else next.delete('min')
                  if (max) next.set('max', max)
                  else next.delete('max')
                  next.delete('pagina')
                  router.push(`${pathname}?${next.toString()}`)
                }}
                className={`rounded-xl px-3 py-2 text-left text-sm transition
                  ${
                    isActive
                      ? 'bg-stone-900 font-medium text-white'
                      : 'text-slate-600 hover:bg-stone-50'
                  }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="bento-card">
        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={params.get('stock') === 'true'}
            onChange={(e) => updateParam('stock', e.target.checked ? 'true' : null)}
            className="h-4 w-4 accent-stone-900"
          />
          <span className="text-sm text-stone-700">Solo con stock</span>
        </label>

        {params.toString() && (
          <button
            onClick={() => router.push(pathname)}
            className="mt-4 text-left text-xs text-slate-400 underline transition hover:text-slate-700"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </aside>
  )
}
