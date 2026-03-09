// __tests__/e2e/registro.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Flujo de registro — VENTO', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/registro')
  })

  test('muestra el formulario de registro', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /nueva cuenta/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/contraseña/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeVisible()
  })

  test('muestra errores al enviar campos vacíos', async ({ page }) => {
    await page.getByLabel(/email/i).fill('no-es-email')
    await page.getByLabel(/contraseña/i).fill('corta')
    await page.getByRole('button', { name: /crear cuenta/i }).click()

    // Espera algún mensaje de error visible
    await expect(page.locator('[role="alert"]').first()).toBeVisible()
  })

  test('registra usuario nuevo y redirige al dashboard', async ({ page }) => {
    const timestamp = Date.now()
    const email = `test${timestamp}@vento.com`

    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/contraseña/i).fill('Vento123')
    await page.getByRole('button', { name: /crear cuenta/i }).click()

    // Debe redirigir al dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
  })

  test('tiene link de vuelta al login', async ({ page }) => {
    await expect(page.getByRole('link', { name: /iniciá sesión/i })).toBeVisible()
  })

})
