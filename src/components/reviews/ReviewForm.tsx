'use client'
// src/components/reviews/ReviewForm.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StarRating } from './StarRating'

type Props = { productId: string; onSuccess?: () => void }

export function ReviewForm({ productId, onSuccess }: Props) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const res = await fetch('/api/reviews', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ productId, rating, title, body }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      if (data.errors) setErrors(data.errors)
      else setErrors({ _: data.error ?? 'Error al enviar la reseña' })
      return
    }

    setSubmitted(true)
    onSuccess?.()
    router.refresh()
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
        <p className="text-green-800 font-medium">¡Gracias por tu reseña!</p>
        <p className="text-green-600 text-sm mt-1">Ya está publicada en el producto.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-stone-700">Calificación *</label>
        <StarRating value={rating} interactive onChange={setRating} size="lg" />
        {errors['rating'] && <span className="text-xs text-red-600" role="alert">{errors['rating']}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="review-title" className="text-sm font-medium text-stone-700">Título *</label>
        <input
          id="review-title" type="text" value={title}
          onChange={e => setTitle(e.target.value)} placeholder="Resumí tu experiencia"
          aria-invalid={!!errors['title']}
          className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none
                     focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition
                     aria-[invalid=true]:border-red-400"
        />
        {errors['title'] && <span className="text-xs text-red-600" role="alert">{errors['title']}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="review-body" className="text-sm font-medium text-stone-700">Reseña *</label>
        <textarea
          id="review-body" rows={4} value={body}
          onChange={e => setBody(e.target.value)} placeholder="Contanos más sobre el producto..."
          aria-invalid={!!errors['body']}
          className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none resize-none
                     focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition
                     aria-[invalid=true]:border-red-400"
        />
        <span className="text-xs text-stone-400 text-right">{body.length}/1000</span>
        {errors['body'] && <span className="text-xs text-red-600" role="alert">{errors['body']}</span>}
      </div>

      {errors['_'] && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3" role="alert">
          {errors['_']}
        </p>
      )}

      <button type="submit" disabled={loading || rating === 0}
        className="bg-stone-900 text-white py-3 rounded-xl text-sm font-medium
                   hover:bg-stone-800 disabled:opacity-50 transition">
        {loading ? 'Enviando...' : 'Publicar reseña'}
      </button>
    </form>
  )
}
