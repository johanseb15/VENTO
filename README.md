# VENTO — Fase 4: Búsqueda, Wishlist, Reseñas y Emails

## Archivos nuevos

```
src/
├── domain/
│   ├── search.ts          ← sanitización, buildSearchWhere (FP)
│   ├── review.ts          ← validación, calcReviewStats (FP)
│   └── wishlist.ts        ← toggle, add/remove (FP)
├── application/
│   ├── SearchService.ts
│   ├── ReviewService.ts   ← verifica compra antes de publicar
│   └── WishlistService.ts
├── infrastructure/
│   ├── db/
│   │   ├── PrismaSearchRepository.ts
│   │   ├── PrismaReviewRepository.ts
│   │   └── PrismaWishlistRepository.ts
│   └── email/
│       └── TransactionalMailer.ts   ← bienvenida + recupero
├── components/
│   ├── search/SearchBar.tsx
│   ├── wishlist/WishlistToggleButton.tsx
│   └── reviews/
│       ├── StarRating.tsx
│       ├── ReviewForm.tsx
│       └── ReviewList.tsx
├── app/
│   ├── api/
│   │   ├── search/route.ts
│   │   ├── reviews/route.ts
│   │   ├── wishlist/route.ts
│   │   ├── auth/forgot-password/route.ts
│   │   └── auth/reset-password/route.ts
│   ├── (shop)/
│   │   ├── buscar/page.tsx
│   │   └── wishlist/page.tsx
│   └── (auth)/
│       ├── forgot-password/page.tsx
│       └── reset-password/page.tsx
└── prisma/schema-additions-fase4.prisma

__tests__/
├── domain/
│   ├── search.test.ts     (13 tests)
│   ├── review.test.ts     (14 tests)
│   └── wishlist.test.ts   (8 tests)
├── application/
│   ├── ReviewService.test.ts   (6 tests)
│   └── WishlistService.test.ts (4 tests)
└── e2e/fase4.spec.ts           (11 tests)
```

## Setup

```bash
# 1. Agregar modelos al schema (Review, WishlistItem, PasswordResetToken)
#    Ver prisma/schema-additions-fase4.prisma

npx prisma migrate dev --name "fase4-reviews-wishlist-reset"

# 2. No hay dependencias nuevas (usa Resend de Fase 3)
```

## Agregar link "Olvidé mi contraseña" en el LoginForm

En `src/components/auth/LoginForm.tsx`, al final del form agregar:

```tsx
<Link href="/forgot-password"
  className="text-center text-xs text-stone-400 hover:text-stone-600 transition">
  ¿Olvidaste tu contraseña?
</Link>
```

## Integrar reseñas en la página de producto

En `src/app/(shop)/[slug]/page.tsx`, agregar al final:

```tsx
import { ReviewService } from '@application/ReviewService'
import { PrismaReviewRepository } from '@infrastructure/db/PrismaReviewRepository'
import { ReviewList } from '@components/reviews/ReviewList'
import { ReviewForm } from '@components/reviews/ReviewForm'

// En el componente:
const reviewService = new ReviewService(new PrismaReviewRepository())
const { reviews, stats } = await reviewService.getProductReviews(product.id)

// En el JSX:
<section>
  <h2>Reseñas ({stats.count})</h2>
  <ReviewList reviews={reviews} />
  <ReviewForm productId={product.id} />
</section>
```

## Enviar email de bienvenida al registrarse

En `src/app/api/auth/register/route.ts`, después de crear el usuario:

```ts
import { TransactionalMailer } from '@infrastructure/email/TransactionalMailer'
const mailer = new TransactionalMailer()
// Después del prisma.user.create:
try {
  await mailer.sendWelcome(user.email, user.name)
} catch { /* no fallar el registro si el email falla */ }
```

---

## Total del proyecto VENTO

| Fase | Features | Tests nuevos | Tests acum. |
|------|----------|-------------|------------|
| 1    | Base + registro | 34 | 34 |
| 2    | Catálogo, carrito, checkout, cupones | 60+ | 94+ |
| 3    | Auth, admin, Stripe webhook, emails | 24+ | 118+ |
| 4    | Búsqueda, wishlist, reseñas, emails transaccionales | 56 | 174+ |
