import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config({
  path: '../.env',
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Brak DATABASE_URL w głównym pliku .env');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

async function seedUsers() {
  const users = [
    {
      email: 'admin@supermed.pl',
      password: 'Admin1234!',
      role: 'ADMIN' as const,
    },
    {
      email: 'director@supermed.pl',
      password: 'Director1234!',
      role: 'DIRECTOR' as const,
    },
    {
      email: 'employee@supermed.pl',
      password: 'Employee1234!',
      role: 'EMPLOYEE' as const,
    },
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 12);

    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        passwordHash,
        role: user.role,
        status: 'ACTIVE',
      },
      create: {
        email: user.email,
        passwordHash,
        role: user.role,
        status: 'ACTIVE',
      },
    });
  }
}

async function main() {
  await seedUsers();

  console.log('Seed zakończony.');
  console.log('Utworzono lub zaktualizowano konta testowe:');
  console.log('admin@supermed.pl / Admin1234!');
  console.log('director@supermed.pl / Director1234!');
  console.log('employee@supermed.pl / Employee1234!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });