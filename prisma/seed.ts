import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash('Password123!', saltRounds);

  const user = await prisma.user.upsert({
    where: { email: 'demo@blog.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@blog.com',
      username: 'demouser',
      password: hashedPassword,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    },
  });

  await prisma.comment.createMany({
    data: [
      { content: 'Welcome to the blog!', userId: user.id },
      { content: 'This is a sample comment.', userId: user.id },
    ],
    skipDuplicates: true,
  });

  console.log('Seed completed.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
