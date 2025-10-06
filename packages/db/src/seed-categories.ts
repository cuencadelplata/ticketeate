import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { id: 1, name: 'Música' },
  { id: 2, name: 'Deportes' },
  { id: 3, name: 'Conferencias' },
  { id: 4, name: 'Teatro' },
  { id: 5, name: 'Comedia' },
  { id: 6, name: 'Arte y Cultura' },
  { id: 7, name: 'Gastronomía' },
  { id: 8, name: 'Tecnología' },
];

async function seedCategories() {
  for (const category of categories) {
    await prisma.categoriaevento.upsert({
      where: { categoriaeventoid: BigInt(category.id) },
      update: { nombre: category.name },
      create: {
        categoriaeventoid: BigInt(category.id),
        nombre: category.name,
        descripcion: null,
      },
    });
  }
}

async function main() {
  try {
    await seedCategories();
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
