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

async function seedStaffUsers() {
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

async function seedPatients() {
  const patients = [
    {
      firstName: 'Jan',
      lastName: 'Kowalski',
      pesel: '12345678901',
      email: 'jan.kowalski@supermed.pl',
      password: 'Patient1234!',
      isAuthorized: false,
      assignedDoctorName: 'dr Anna Nowak',
      isActive: true,
      userStatus: 'PENDING_VERIFICATION' as const,
    },
    {
      firstName: 'Maria',
      lastName: 'Wiśniewska',
      pesel: '98765432109',
      email: 'maria.wisniewska@supermed.pl',
      password: 'Patient1234!',
      isAuthorized: true,
      assignedDoctorName: 'dr Piotr Zieliński',
      isActive: true,
      userStatus: 'ACTIVE' as const,
    },
    {
      firstName: 'Tomasz',
      lastName: 'Wójcik',
      pesel: '11223344556',
      email: 'tomasz.wojcik@supermed.pl',
      password: 'Patient1234!',
      isAuthorized: true,
      assignedDoctorName: null,
      isActive: false,
      userStatus: 'INACTIVE' as const,
    },
  ];

  for (const patient of patients) {
    const passwordHash = await bcrypt.hash(patient.password, 12);

    const user = await prisma.user.upsert({
      where: {
        email: patient.email,
      },
      update: {
        passwordHash,
        role: 'PATIENT',
        status: patient.userStatus,
      },
      create: {
        email: patient.email,
        passwordHash,
        role: 'PATIENT',
        status: patient.userStatus,
      },
      select: {
        id: true,
      },
    });

    await prisma.patient.upsert({
      where: {
        email: patient.email,
      },
      update: {
        userId: user.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        pesel: patient.pesel,
        isAuthorized: patient.isAuthorized,
        assignedDoctorName: patient.assignedDoctorName,
        isActive: patient.isActive,
      },
      create: {
        userId: user.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        pesel: patient.pesel,
        email: patient.email,
        isAuthorized: patient.isAuthorized,
        assignedDoctorName: patient.assignedDoctorName,
        isActive: patient.isActive,
      },
    });
  }
}

async function main() {
  await seedStaffUsers();
  await seedPatients();

  console.log('Seed zakończony.');
  console.log('Konta personelu:');
  console.log('admin@supermed.pl / Admin1234!');
  console.log('director@supermed.pl / Director1234!');
  console.log('employee@supermed.pl / Employee1234!');
  console.log('');
  console.log('Konta pacjentów:');
  console.log('jan.kowalski@supermed.pl / Patient1234!');
  console.log('maria.wisniewska@supermed.pl / Patient1234!');
  console.log('tomasz.wojcik@supermed.pl / Patient1234!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
