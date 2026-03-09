// __tests__/e2e/fase4.spec.ts
import { test, expect } from '@playwright/test'

// ── Búsqueda ──────────────────────────────────
test.describe('Búsqueda full-text', () => {
  test('muestra resultados para una query válida', async ({ page }) => {
    await page.goto('/buscar?q=remera')
    await expect(page.getByText(/resultado/i)).toBeVisible()
  })

  test('muestra mensaje cuando no hay resultados', async ({ page }) => {
    await page.goto('/buscar?q=xyzproductoinexistente')
    await expect(page.getByText(/no encontramos/i)).toBeVisible()
  })

  test('buscar desde el SearchBar navega a /buscar', async ({ page }) => {
    await page.goto('/buscar')
    await page.getByLabel(/buscar en el catálogo/i).fill('jean')
    await page.getByRole('button', { name: /buscar/i }).click()
    await expect(page).toHaveURL(/q=jean/)
  })

  test('query de 1 carácter muestra mensaje de ayuda', async ({ page }) => {
    await page.goto('/buscar?q=r')
    await expect(page.getByText(/al menos 2 caracteres/i)).toBeVisible()
  })
})

// ── Wishlist ──────────────────────────────────
test.describe('Wishlist', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@vento.com')
    await page.getByLabel(/contraseña/i).fill('Admin1234')
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await page.waitForURL(/^(?!.*login)/)
  })

  test('accede a la página de wishlist', async ({ page }) => {
    await page.goto('/wishlist')
    await expect(page.getByRole('heading', { name: /mi wishlist/i })).toBeVisible()
  })

  test('wishlist vacía muestra mensaje', async ({ page }) => {
    await page.goto('/wishlist')
    await expect(page.getByText(/vacía/i)).toBeVisible()
  })

  test('redirige a login si no hay sesión', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/wishlist')
    await expect(page).toHaveURL(/login/)
  })
})

// ── Auth: forgot password ─────────────────────
test.describe('Recupero de contraseña', () => {
  test('muestra el formulario de recupero', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /enviar instrucciones/i })).toBeVisible()
  })

  test('enviar muestra mensaje de confirmación', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.getByLabel(/email/i).fill('cualquier@email.com')
    await page.getByRole('button', { name: /enviar instrucciones/i }).click()
    await expect(page.getByText(/revisá tu email/i)).toBeVisible()
  })

  test('link desde login funciona', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /olvidaste|recuperar/i }).click()
    await expect(page).toHaveURL('/forgot-password')
  })
})
