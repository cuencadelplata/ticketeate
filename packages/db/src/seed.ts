import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.evento.deleteMany();
  await prisma.usuario.deleteMany();

  // Create a user
  const user = await prisma.usuario.create({
    data: {
      id_usuario: 'user_2example123', // Mock Clerk ID
      email: 'user@example.com',
      nombre: 'John',
      apellido: 'Doe',
    },
  });

  // Create some events
  await prisma.evento.createMany({
    data: [
      {
        titulo: 'First Event',
        descripcion: 'This is my first event!',
        fecha_inicio_venta: new Date(),
        fecha_fin_venta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
        id_creador: user.id_usuario,
      },
      {
        titulo: 'Second Event',
        descripcion: 'This is my second event!',
        fecha_inicio_venta: new Date(),
        fecha_fin_venta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
        id_creador: user.id_usuario,
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
