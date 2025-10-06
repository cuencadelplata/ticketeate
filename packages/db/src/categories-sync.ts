import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// categorías estáticas del frontend
const staticCategories = [
  { id: 1, name: 'Música' },
  { id: 2, name: 'Deportes' },
  { id: 3, name: 'Conferencias' },
  { id: 4, name: 'Teatro' },
  { id: 5, name: 'Comedia' },
  { id: 6, name: 'Arte y Cultura' },
  { id: 7, name: 'Gastronomía' },
  { id: 8, name: 'Tecnología' },
];

async function syncCategories() {
  for (const category of staticCategories) {
    await prisma.categoriaevento.upsert({
      where: { categoriaeventoid: category.id },
      update: {
        nombre: category.name,
        descripcion: null,
      },
      create: {
        categoriaeventoid: category.id,
        nombre: category.name,
        descripcion: null,
      },
    });
  }
}

async function verifyCategories() {
  const dbCategories = await prisma.categoriaevento.findMany({
    orderBy: { categoriaeventoid: 'asc' },
  });
}

async function main() {
  try {
    const command = process.argv[2];

    switch (command) {
      case 'sync':
        await syncCategories();
        break;
      case 'verify':
        await verifyCategories();
        break;
      default:
        console.log('Uso: npm run categories:sync [sync|verify]');
        console.log('  sync   - Sincroniza las categorías estáticas con la base de datos');
        console.log('  verify - Verifica las categorías en la base de datos');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
