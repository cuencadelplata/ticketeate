import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create a user
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'John Doe',
    },
  });

  // Create some posts
  await prisma.post.createMany({
    data: [
      {
        title: 'First Post',
        content: 'This is my first post!',
        published: true,
        authorId: user.id,
      },
      {
        title: 'Second Post',
        content: 'This is my second post!',
        published: false,
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
