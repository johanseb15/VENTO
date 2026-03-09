// src/domain/cart.ts
// Lógica del carrito — funciones puras (FP)
// El estado del carrito vive en el cliente (zustand) y se sincroniza con DB

export type CartProduct = {
  id: string
  name: string
  price: number   // centavos
  stock: number
  image: string
}

export type CartItem = {
  product: CartProduct
  quantity: number
}

export type Cart = {
  items: CartItem[]
}

// ── OPERACIONES ───────────────────────────────

/** Agrega un producto al carrito. Si ya existe, incrementa la cantidad.
 *  Respeta el límite de stock disponible. */
export const addItem = (cart: Cart, product: CartProduct, qty = 1): Cart => {
  const existing = cart.items.find((i) => i.product.id === product.id)

  if (existing) {
    const newQty = Math.min(existing.quantity + qty, product.stock)
    return {
      items: cart.items.map((i) =>
        i.product.id === product.id ? { ...i, quantity: newQty } : i
      ),
    }
  }

  if (product.stock === 0) return cart

  return {
    items: [...cart.items, { product, quantity: Math.min(qty, product.stock) }],
  }
}

/** Elimina un item del carrito por productId */
export const removeItem = (cart: Cart, productId: string): Cart => ({
  items: cart.items.filter((i) => i.product.id !== productId),
})

/** Cambia la cantidad de un item. Si qty <= 0, elimina el item. */
export const updateQuantity = (
  cart: Cart,
  productId: string,
  qty: number
): Cart => {
  if (qty <= 0) return removeItem(cart, productId)

  return {
    items: cart.items.map((i) =>
      i.product.id === productId
        ? { ...i, quantity: Math.min(qty, i.product.stock) }
        : i
    ),
  }
}

/** Vacía el carrito */
export const clearCart = (): Cart => ({ items: [] })

// ── QUERIES ───────────────────────────────────

/** Total de unidades en el carrito */
export const itemCount = (cart: Cart): number =>
  cart.items.reduce((acc, i) => acc + i.quantity, 0)

/** Subtotal en centavos */
export const subtotal = (cart: Cart): number =>
  cart.items.reduce((acc, i) => acc + i.product.price * i.quantity, 0)

/** ¿El carrito está vacío? */
export const isEmpty = (cart: Cart): boolean => cart.items.length === 0
