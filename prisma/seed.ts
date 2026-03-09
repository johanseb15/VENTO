// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding VENTO database...')

  // Categorías
  const categorias = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'remeras' },
      update: {},
      create: { name: 'Remeras', slug: 'remeras' },
    }),
    prisma.category.upsert({
      where: { slug: 'pantalones' },
      update: {},
      create: { name: 'Pantalones', slug: 'pantalones' },
    }),
    prisma.category.upsert({
      where: { slug: 'accesorios' },
      update: {},
      create: { name: 'Accesorios', slug: 'accesorios' },
    }),
  ])

  // Admin user
  const adminPassword = await bcrypt.hash('Admin1234', 10)
  await prisma.user.upsert({
    where: { email: 'admin@vento.com' },
    update: {},
    create: {
      email: 'admin@vento.com',
      password: adminPassword,
      name: 'Admin VENTO',
      role: 'ADMIN',
    },
  })

  // Productos de prueba
  const productos = [
    {
      name: 'Remera Vento Classic',
      slug: 'remera-vento-classic',
      description: 'Remera de algodón premium con logo bordado.',
      price: 4500,   // $45.00
      stock: 50,
      categoryId: categorias[0]!.id,
      images: ['/images/product-placeholder.svg'],
    },
    {
      name: 'Remera Oversize Wind',
      slug: 'remera-oversize-wind',
      description: 'Corte oversize, tela francesa 280gr.',
      price: 5900,
      stock: 30,
      categoryId: categorias[0]!.id,
      images: ['/images/product-placeholder.svg'],
    },
    {
      name: 'Jean Slim Vento',
      slug: 'jean-slim-vento',
      description: 'Jean de corte slim con elastano para mayor comodidad.',
      price: 12000,
      stock: 25,
      categoryId: categorias[1]!.id,
      images: ['/images/product-placeholder.svg'],
    },
    {
      name: 'Gorra Vento Cap',
      slug: 'gorra-vento-cap',
      description: 'Gorra de 6 paneles con logo bordado.',
      price: 3200,
      stock: 100,
      categoryId: categorias[2]!.id,
      images: ['/images/product-placeholder.svg'],
    },
    {
      name: 'Bolso Tote Vento',
      slug: 'bolso-tote-vento',
      description: 'Bolso tote de lona resistente.',
      price: 2800,
      stock: 0,   // sin stock — para testear
      categoryId: categorias[2]!.id,
      images: ['/images/product-placeholder.svg'],
    },
  ]

  for (const producto of productos) {
    await prisma.product.upsert({
      where: { slug: producto.slug },
      update: {},
      create: producto,
    })
  }

  // Cupón de prueba
  await prisma.coupon.upsert({
    where: { code: 'VENTO20' },
    update: {},
    create: {
      code: 'VENTO20',
      type: 'PERCENT',
      value: 20,
      maxUses: 100,
      isActive: true,
    },
  })

  console.log('✅ Seed completado.')
  console.log('   Admin: admin@vento.com / Admin1234')
  console.log('   Cupón:  VENTO20 (20% off)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
