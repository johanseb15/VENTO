// __tests__/e2e/catalogo.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Catálogo de productos', () => {

  test('muestra los productos del catálogo', async ({ page }) => {
    await page.goto('/productos')
    await expect(page.getByRole('heading', { name: /productos/i })).toBeVisible()
    // Debe haber al menos un producto (del seed)
    await expect(page.locator('article').first()).toBeVisible()
  })

  test('filtra por categoría', async ({ page }) => {
    await page.goto('/productos')
    await page.getByRole('button', { name: /remeras/i }).click()
    await expect(page).toHaveURL(/categoria=remeras/)
  })

  test('filtra por stock disponible', async ({ page }) => {
    await page.goto('/productos')
    await page.getByRole('checkbox', { name: /solo con stock/i }).check()
    await expect(page).toHaveURL(/stock=true/)
    // Ningún producto debe mostrar "Agotado"
    await expect(page.getByText('Agotado')).not.toBeVisible()
  })

  test('product card agrega al carrito', async ({ page }) => {
    await page.goto('/productos')
    const firstCard = page.locator('article').first()
    await firstCard.getByRole('button', { name: /agregar/i }).click()
    // El contador del carrito debe aumentar
    await expect(page.getByTestId('cart-count')).toHaveText('1')
  })

})

// __tests__/e2e/checkout.spec.ts
test.describe('Flujo de checkout', () => {

  test.beforeEach(async ({ page }) => {
    // Agregar producto al carrito via localStorage
    await page.goto('/productos')
    await page.locator('article').first()
      .getByRole('button', { name: /agregar/i }).click()
    await page.goto('/checkout')
  })

  test('muestra el formulario de checkout con items del carrito', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /checkout/i })).toBeVisible()
    await expect(page.getByText(/subtotal/i)).toBeVisible()
  })

  test('valida cupón válido VENTO20', async ({ page }) => {
    await page.getByLabel(/código de cupón/i).fill('VENTO20')
    await page.getByRole('button', { name: /aplicar/i }).click()
    await expect(page.getByText(/cupón aplicado/i)).toBeVisible()
  })

  test('rechaza cupón inexistente', async ({ page }) => {
    await page.getByLabel(/código de cupón/i).fill('CUPONFAKE')
    await page.getByRole('button', { name: /aplicar/i }).click()
    await expect(page.getByText(/no existe/i)).toBeVisible()
  })

  test('muestra errores de validación de dirección', async ({ page }) => {
    await page.getByRole('button', { name: /confirmar pedido/i }).click()
    await expect(page.locator('[role="alert"]').first()).toBeVisible()
  })

})
