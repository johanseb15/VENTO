// __tests__/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Autenticación', () => {

  test('muestra el formulario de login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /vento/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/contraseña/i)).toBeVisible()
  })

  test('login exitoso con credenciales del seed', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@vento.com')
    await page.getByLabel(/contraseña/i).fill('Admin1234')
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await expect(page).not.toHaveURL('/login')
  })

  test('muestra error con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('noexiste@vento.com')
    await page.getByLabel(/contraseña/i).fill('WrongPass1')
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await expect(page.getByRole('alert')).toContainText(/incorrectos/i)
  })

  test('redirige a /login al acceder a /dashboard sin sesión', async ({ page }) => {
    await page.goto('/dashboard/pedidos')
    await expect(page).toHaveURL(/login/)
  })

  test('redirige a /login al acceder a /admin sin sesión', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page).toHaveURL(/login/)
  })

})

// __tests__/e2e/admin.spec.ts
test.describe('Panel de Admin', () => {

  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@vento.com')
    await page.getByLabel(/contraseña/i).fill('Admin1234')
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await page.waitForURL(/^(?!.*login)/)
  })

  test('accede al dashboard de admin', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })

  test('lista los productos en el panel admin', async ({ page }) => {
    await page.goto('/admin/productos')
    await expect(page.getByRole('heading', { name: /productos/i })).toBeVisible()
    await expect(page.locator('table tbody tr').first()).toBeVisible()
  })

  test('navega al formulario de nuevo producto', async ({ page }) => {
    await page.goto('/admin/productos/nueva')
    await expect(page.getByRole('heading', { name: /nuevo producto/i })).toBeVisible()
    await expect(page.getByLabel(/nombre/i)).toBeVisible()
  })

  test('el slug se genera automáticamente desde el nombre', async ({ page }) => {
    await page.goto('/admin/productos/nueva')
    await page.getByLabel(/nombre \*/i).fill('Pantalón Cargo')
    const slugInput = page.getByLabel(/slug/i)
    await expect(slugInput).toHaveValue('pantalon-cargo')
  })

  test('lista las órdenes en el panel admin', async ({ page }) => {
    await page.goto('/admin/ordenes')
    await expect(page.getByRole('heading', { name: /pedidos/i })).toBeVisible()
  })

})
