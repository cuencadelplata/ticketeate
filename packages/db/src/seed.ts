import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.eventos.deleteMany();
  await prisma.usuarios.deleteMany();

  // Create a user
  const user = await prisma.usuarios.create({
    data: {
      email: 'user@example.com',
      nombre: 'John',
      apellido: 'Doe',
      password_hash: 'dummy_hash_for_seeding',
    },
  });

  // Create some events
  await prisma.eventos.createMany({
    data: [
      {
        titulo: 'First Event',
        descripcion: 'This is my first event!',
        fecha_inicio_venta: new Date(),
        fecha_fin_venta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
      },
      {
        titulo: 'Second Event',
        descripcion: 'This is my second event!',
        fecha_inicio_venta: new Date(),
        fecha_fin_venta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
      },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
