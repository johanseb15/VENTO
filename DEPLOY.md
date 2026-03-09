# VENTO — Deploy a Vercel + Neon (Fase 3)

## 1. Base de datos en producción (Neon)

```bash
# Crear cuenta en https://neon.tech (free tier)
# Crear proyecto "vento-prod"
# Copiar la connection string: postgresql://...@ep-xxx.neon.tech/vento?sslmode=require
```

## 2. Variables de entorno en Vercel

En el panel de Vercel → Settings → Environment Variables, agregar:

```
DATABASE_URL               = postgresql://...@neon.tech/vento?sslmode=require
DIRECT_URL                 = postgresql://...@neon.tech/vento?sslmode=require&connect_timeout=15

NEXTAUTH_SECRET            = [generar: openssl rand -base64 32]
NEXTAUTH_URL               = https://tu-dominio.vercel.app

STRIPE_PUBLIC_KEY          = pk_live_...  (o pk_test_ para staging)
STRIPE_SECRET_KEY          = sk_live_...
STRIPE_WEBHOOK_SECRET      = whsec_...   (ver paso 4)

RESEND_API_KEY             = re_...
EMAIL_FROM                 = VENTO <noreply@tu-dominio.com.ar>

NEXT_PUBLIC_APP_URL        = https://tu-dominio.vercel.app
```

## 3. Primer deploy

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desde la raíz del proyecto
vercel login
vercel link          # vincular al proyecto de Vercel
vercel env pull      # descargar .env.local con las vars de producción

# Migrar la DB de producción
DATABASE_URL="postgresql://...neon..." npx prisma migrate deploy
DATABASE_URL="postgresql://...neon..." npx prisma db seed

# Deploy manual (opcional, CI lo hace automático)
vercel --prod
```

## 4. Configurar webhook de Stripe

```bash
# En el dashboard de Stripe → Developers → Webhooks
# Agregar endpoint: https://tu-dominio.vercel.app/api/webhooks/stripe
# Seleccionar eventos:
#   - payment_intent.succeeded
#   - payment_intent.payment_failed

# Copiar el "Signing secret" (whsec_...) a la var STRIPE_WEBHOOK_SECRET
```

## 5. Configurar dominio de email en Resend

```bash
# En https://resend.com → Domains → Add Domain
# Agregar tu dominio (ej: vento.com.ar)
# Seguir las instrucciones DNS (agregar registros TXT, MX, DKIM)
# Esperar verificación (~5 min)
# Crear API key con permisos de envío
```

## 6. Secrets de GitHub (para CI/CD automático)

En tu repo → Settings → Secrets → Actions:

```
VERCEL_TOKEN       = [Vercel → Account Settings → Tokens]
VERCEL_ORG_ID      = [output de: vercel whoami --token=...]
VERCEL_PROJECT_ID  = [en .vercel/project.json después de vercel link]
```

## 7. Flujo de deploy automático

```
git push origin main
  → GitHub Actions: lint → unit tests → build → E2E → deploy a Vercel
```

## 8. Verificar en producción

```
✅ https://tu-dominio.vercel.app/              → Home
✅ https://tu-dominio.vercel.app/productos     → Catálogo
✅ https://tu-dominio.vercel.app/login         → Login
✅ https://tu-dominio.vercel.app/admin/dashboard → Admin (requiere ADMIN role)

# Test de pago: 4242 4242 4242 4242 (cualquier fecha futura)
# Verificar que llegue el email de confirmación
```

## 9. Monitoreo

- **Vercel Analytics**: activar en el panel de Vercel
- **Sentry** (opcional): `npm install @sentry/nextjs` para error tracking
- **Stripe Dashboard**: ver pagos en tiempo real
- **Resend Dashboard**: ver emails enviados y bounces
