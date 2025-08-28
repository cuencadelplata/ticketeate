import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // Create a user
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'John Doe',
    },
  });

  // Create some posts
  await prisma.event.createMany({
    data: [
      {
        name: 'First Event',
        description: 'This is my first event!',
        startDate: new Date(),
        endDate: new Date(),
        authorId: user.id,
      },
      {
        name: 'Second Event',
        description: 'This is my second event!',
        startDate: new Date(),
        endDate: new Date(),
        authorId: user.id,
      },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
