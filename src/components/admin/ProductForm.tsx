'use client'
// src/components/admin/ProductForm.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateSlug } from '@domain/admin'
import { formatPrice } from '@domain/pricing'

type Category = { id: string; name: string }

type ProductFormData = {
  name: string
  slug: string
  description: string
  price: string     // string para el input, se convierte a centavos al enviar
  stock: string
  categoryId: string
  isActive: boolean
  images: string[]
}

type Props = {
  categories: Category[]
  initialData?: Partial<ProductFormData & { id: string }>
  mode: 'create' | 'edit'
}

const empty: ProductFormData = {
  name: '', slug: '', description: '',
  price: '', stock: '', categoryId: '',
  isActive: true, images: [],
}

export function ProductForm({ categories, initialData, mode }: Props) {
  const router = useRouter()
  const [data, setData] = useState<ProductFormData>({
    ...empty, ...initialData,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [imageInput, setImageInput] = useState('')

  const update = (field: keyof ProductFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value
      setData(d => ({ ...d, [field]: value }))
      setErrors(err => { const n = { ...err }; delete n[field]; return n })
    }

  // Auto-generar slug desde el nombre (solo en modo create)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setData(d => ({
      ...d,
      name,
      slug: mode === 'create' ? generateSlug(name) : d.slug,
    }))
  }

  const addImage = () => {
    if (!imageInput.trim()) return
    setData(d => ({ ...d, images: [...d.images, imageInput.trim()] }))
    setImageInput('')
  }

  const removeImage = (idx: number) => {
    setData(d => ({ ...d, images: d.images.filter((_, i) => i !== idx) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const payload = {
      ...data,
      price: Math.round(parseFloat(data.price || '0') * 100),  // pesos → centavos
      stock: parseInt(data.stock || '0'),
    }

    const url = mode === 'create'
      ? '/api/admin/products'
      : `/api/admin/products/${initialData?.id}`

    const res = await fetch(url, {
      method: mode === 'create' ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const json = await res.json()
    setLoading(false)

    if (!res.ok) {
      if (json.errors) setErrors(json.errors)
      return
    }

    router.push('/admin/productos')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 max-w-2xl">

      {/* Nombre + Slug */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-stone-700">Nombre *</label>
          <input id="name" type="text" value={data.name} onChange={handleNameChange}
            aria-invalid={!!errors['name']}
            className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none
                       focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition
                       aria-[invalid=true]:border-red-400" />
          {errors['name'] && <span className="text-xs text-red-600" role="alert">{errors['name']}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="slug" className="text-sm font-medium text-stone-700">Slug *</label>
          <input id="slug" type="text" value={data.slug} onChange={update('slug')}
            aria-invalid={!!errors['slug']}
            className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none font-mono
                       focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition
                       aria-[invalid=true]:border-red-400" />
          {errors['slug'] && <span className="text-xs text-red-600" role="alert">{errors['slug']}</span>}
        </div>
      </div>

      {/* Descripción */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-stone-700">Descripción</label>
        <textarea id="description" rows={3} value={data.description} onChange={update('description')}
          className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none resize-none
                     focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition" />
      </div>

      {/* Precio + Stock + Categoría */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="price" className="text-sm font-medium text-stone-700">Precio (ARS) *</label>
          <input id="price" type="number" min="0" step="0.01" value={data.price} onChange={update('price')}
            aria-invalid={!!errors['price']}
            className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none
                       focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition
                       aria-[invalid=true]:border-red-400" />
          {data.price && <span className="text-xs text-stone-400">{formatPrice(Math.round(parseFloat(data.price) * 100))}</span>}
          {errors['price'] && <span className="text-xs text-red-600" role="alert">{errors['price']}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="stock" className="text-sm font-medium text-stone-700">Stock *</label>
          <input id="stock" type="number" min="0" step="1" value={data.stock} onChange={update('stock')}
            aria-invalid={!!errors['stock']}
            className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none
                       focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition
                       aria-[invalid=true]:border-red-400" />
          {errors['stock'] && <span className="text-xs text-red-600" role="alert">{errors['stock']}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="categoryId" className="text-sm font-medium text-stone-700">Categoría *</label>
          <select id="categoryId" value={data.categoryId} onChange={update('categoryId')}
            aria-invalid={!!errors['categoryId']}
            className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none
                       focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition
                       aria-[invalid=true]:border-red-400">
            <option value="">Seleccionar...</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors['categoryId'] && <span className="text-xs text-red-600" role="alert">{errors['categoryId']}</span>}
        </div>
      </div>

      {/* Imágenes */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-stone-700">Imágenes (URLs)</label>
        <div className="flex gap-2">
          <input type="url" value={imageInput} onChange={e => setImageInput(e.target.value)}
            placeholder="https://..."
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage() }}}
            className="flex-1 border border-stone-200 rounded-lg px-3 py-2.5 text-sm outline-none
                       focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition" />
          <button type="button" onClick={addImage}
            className="px-4 py-2.5 text-sm font-medium border border-stone-300 rounded-lg hover:bg-stone-50 transition">
            Agregar
          </button>
        </div>
        {data.images.map((url, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-stone-600 bg-stone-50 rounded-lg px-3 py-2">
            <span className="flex-1 truncate font-mono text-xs">{url}</span>
            <button type="button" onClick={() => removeImage(i)}
              className="text-stone-400 hover:text-red-500 transition text-xs">✕</button>
          </div>
        ))}
      </div>

      {/* Activo */}
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input type="checkbox" checked={data.isActive}
          onChange={e => setData(d => ({ ...d, isActive: e.target.checked }))}
          className="w-4 h-4 accent-stone-900" />
        <span className="text-sm text-stone-700">Producto activo (visible en la tienda)</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="bg-stone-900 text-white px-6 py-3 rounded-xl text-sm font-medium
                     hover:bg-stone-800 disabled:opacity-50 transition">
          {loading ? 'Guardando...' : mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-3 rounded-xl text-sm font-medium border border-stone-200
                     text-stone-600 hover:bg-stone-50 transition">
          Cancelar
        </button>
      </div>

    </form>
  )
}
