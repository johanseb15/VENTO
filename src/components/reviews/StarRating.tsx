'use client'
// src/components/reviews/StarRating.tsx
type Props = {
  value: number        // 0-5
  max?: number
  interactive?: boolean
  onChange?: (v: number) => void
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }

export function StarRating({ value, max = 5, interactive = false, onChange, size = 'md' }: Props) {
  if (!interactive) {
    return (
      <span className={`${SIZES[size]} tracking-tight`} aria-label={`${value} de ${max} estrellas`}>
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={i < Math.round(value) ? 'text-amber-400' : 'text-stone-200'}>
            ★
          </span>
        ))}
      </span>
    )
  }

  return (
    <div className={`flex gap-0.5 ${SIZES[size]}`} role="group" aria-label="Calificación">
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i + 1)}
          aria-label={`${i + 1} estrella${i + 1 !== 1 ? 's' : ''}`}
          aria-pressed={value === i + 1}
          className={`transition hover:scale-110 ${i < value ? 'text-amber-400' : 'text-stone-300 hover:text-amber-300'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
