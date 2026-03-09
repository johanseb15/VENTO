// src/components/reviews/ReviewList.tsx
import { StarRating } from './StarRating'
import { calcReviewStats, hasEnoughReviews } from '@domain/review'
import type { Review } from '@domain/review'

type Props = { reviews: Review[] }

export function ReviewList({ reviews }: Props) {
  const stats = calcReviewStats(reviews)

  return (
    <div className="flex flex-col gap-8">
      {/* Resumen estadístico */}
      {hasEnoughReviews(stats.count) && (
        <div className="flex items-center gap-6 p-5 bg-stone-50 rounded-xl">
          <div className="text-center">
            <p className="text-4xl font-semibold text-stone-900">{stats.average}</p>
            <StarRating value={stats.average} size="sm" />
            <p className="text-xs text-stone-400 mt-1">{stats.count} reseñas</p>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            {([5, 4, 3, 2, 1] as const).map(star => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="text-stone-400 w-2">{star}</span>
                <span className="text-amber-400 text-xs">★</span>
                <div className="flex-1 bg-stone-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{
                      width: stats.count > 0
                        ? `${(stats.distribution[star] / stats.count) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
                <span className="text-stone-400 w-4 text-right">{stats.distribution[star]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de reseñas */}
      {reviews.length === 0 ? (
        <p className="text-stone-400 text-sm">Este producto todavía no tiene reseñas.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-stone-100">
          {reviews.map(review => (
            <li key={review.id} className="py-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <StarRating value={review.rating} size="sm" />
                  <p className="font-medium text-stone-900 text-sm mt-1">{review.title}</p>
                </div>
                <time className="text-xs text-stone-400 flex-shrink-0">
                  {new Date(review.createdAt).toLocaleDateString('es-AR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </time>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">{review.body}</p>
              <p className="text-xs text-stone-400 mt-2">
                {review.user.name ?? review.user.email.split('@')[0]}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
