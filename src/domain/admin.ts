// src/domain/admin.ts
// Reglas de negocio del panel admin — funciones puras

export type AdminRole = 'ADMIN' | 'USER'

export type ProductInput = {
  name: string
  slug: string
  description: string
  price: number        // centavos
  stock: number
  images: string[]
  categoryId: string
  isActive: boolean
}

export type ProductValidationResult =
  | { valid: true; data: ProductInput }
  | { valid: false; errors: Record<string, string> }

/** Valida los datos de un producto antes de guardar */
export const validateProduct = (input: Partial<ProductInput>): ProductValidationResult => {
  const errors: Record<string, string> = {}

  if (!input.name?.trim()) {
    errors['name'] = 'El nombre es requerido'
  } else if (input.name.trim().length < 3) {
    errors['name'] = 'El nombre debe tener al menos 3 caracteres'
  }

  if (!input.slug?.trim()) {
    errors['slug'] = 'El slug es requerido'
  } else if (!/^[a-z0-9-]+$/.test(input.slug)) {
    errors['slug'] = 'El slug solo puede contener letras minúsculas, números y guiones'
  }

  if (input.price === undefined || input.price === null) {
    errors['price'] = 'El precio es requerido'
  } else if (input.price < 0) {
    errors['price'] = 'El precio no puede ser negativo'
  }

  if (input.stock === undefined || input.stock === null) {
    errors['stock'] = 'El stock es requerido'
  } else if (input.stock < 0) {
    errors['stock'] = 'El stock no puede ser negativo'
  } else if (!Number.isInteger(input.stock)) {
    errors['stock'] = 'El stock debe ser un número entero'
  }

  if (!input.categoryId?.trim()) {
    errors['categoryId'] = 'La categoría es requerida'
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    data: {
      name:        input.name!.trim(),
      slug:        input.slug!.trim(),
      description: input.description?.trim() ?? '',
      price:       Math.round(input.price!),
      stock:       input.stock!,
      images:      input.images ?? [],
      categoryId:  input.categoryId!.trim(),
      isActive:    input.isActive ?? true,
    },
  }
}

/** Genera un slug a partir del nombre del producto */
export const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // quitar tildes
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

/** Verifica que un usuario puede hacer una acción de admin */
export const canManageProducts = (role: AdminRole): boolean => role === 'ADMIN'
export const canViewAdminPanel = (role: AdminRole): boolean => role === 'ADMIN'
