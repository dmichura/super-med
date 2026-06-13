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

async function seedEmployees() {
  const employees = [
    {
      firstName: 'Anna',
      lastName: 'Nowak',
      email: 'anna.nowak@supermed.pl',
      password: 'Employee1234!',
      phoneNumber: '+48 500 100 200',
      userRole: 'EMPLOYEE' as const,
      employeeFunction: 'DOCTOR' as const,
      departmentName: 'Oddział Kardiologii',
      isActive: true,
      userStatus: 'ACTIVE' as const,
    },
    {
      firstName: 'Piotr',
      lastName: 'Zieliński',
      email: 'piotr.zielinski@supermed.pl',
      password: 'Employee1234!',
      phoneNumber: '+48 500 200 300',
      userRole: 'EMPLOYEE' as const,
      employeeFunction: 'DOCTOR' as const,
      departmentName: 'Oddział Neurologii',
      isActive: true,
      userStatus: 'ACTIVE' as const,
    },
    {
      firstName: 'Katarzyna',
      lastName: 'Wójcik',
      email: 'katarzyna.wojcik@supermed.pl',
      password: 'Employee1234!',
      phoneNumber: '+48 500 300 400',
      userRole: 'EMPLOYEE' as const,
      employeeFunction: 'NURSE' as const,
      departmentName: 'Oddział Kardiologii',
      isActive: true,
      userStatus: 'ACTIVE' as const,
    },
    {
      firstName: 'Michał',
      lastName: 'Kamiński',
      email: 'michal.kaminski@supermed.pl',
      password: 'Admin1234!',
      phoneNumber: '+48 500 400 500',
      userRole: 'ADMIN' as const,
      employeeFunction: 'IT_ADMIN' as const,
      departmentName: null,
      isActive: true,
      userStatus: 'ACTIVE' as const,
    },
    {
      firstName: 'Ewa',
      lastName: 'Lewandowska',
      email: 'ewa.lewandowska@supermed.pl',
      password: 'Director1234!',
      phoneNumber: '+48 500 500 600',
      userRole: 'DIRECTOR' as const,
      employeeFunction: 'RECEPTIONIST' as const,
      departmentName: null,
      isActive: false,
      userStatus: 'INACTIVE' as const,
    },
  ];

  for (const employee of employees) {
    const passwordHash = await bcrypt.hash(employee.password, 12);

    const user = await prisma.user.upsert({
      where: {
        email: employee.email,
      },
      update: {
        passwordHash,
        role: employee.userRole,
        status: employee.userStatus,
      },
      create: {
        email: employee.email,
        passwordHash,
        role: employee.userRole,
        status: employee.userStatus,
      },
      select: {
        id: true,
      },
    });

    await prisma.employee.upsert({
      where: {
        email: employee.email,
      },
      update: {
        userId: user.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        phoneNumber: employee.phoneNumber,
        employeeFunction: employee.employeeFunction,
        departmentName: employee.departmentName,
        isActive: employee.isActive,
      },
      create: {
        userId: user.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        employeeFunction: employee.employeeFunction,
        departmentName: employee.departmentName,
        isActive: employee.isActive,
      },
    });
  }
}

async function seedHospitalStructure() {
  const departments = [
    {
      name: 'Oddział Kardiologii',
      code: 'CARD',
      floor: 2,
      headDoctorName: 'dr Anna Nowak',
      rooms: [
        {
          number: '201',
          type: 'Sala dwuosobowa',
          beds: [
            {
              number: '201-A',
              status: 'OCCUPIED' as const,
              patientName: 'Jan Kowalski',
            },
            {
              number: '201-B',
              status: 'FREE' as const,
              patientName: null,
            },
          ],
        },
        {
          number: '202',
          type: 'Sala jednoosobowa',
          beds: [
            {
              number: '202-A',
              status: 'CLEANING' as const,
              patientName: null,
            },
          ],
        },
      ],
    },
    {
      name: 'Oddział Neurologii',
      code: 'NEURO',
      floor: 3,
      headDoctorName: 'dr Piotr Zieliński',
      rooms: [
        {
          number: '301',
          type: 'Sala trzyosobowa',
          beds: [
            {
              number: '301-A',
              status: 'FREE' as const,
              patientName: null,
            },
            {
              number: '301-B',
              status: 'BLOCKED' as const,
              patientName: null,
            },
            {
              number: '301-C',
              status: 'OCCUPIED' as const,
              patientName: 'Maria Wiśniewska',
            },
          ],
        },
      ],
    },
  ];

  for (const departmentData of departments) {
    const department = await prisma.hospitalDepartment.upsert({
      where: {
        code: departmentData.code,
      },
      update: {
        name: departmentData.name,
        floor: departmentData.floor,
        headDoctorName: departmentData.headDoctorName,
      },
      create: {
        name: departmentData.name,
        code: departmentData.code,
        floor: departmentData.floor,
        headDoctorName: departmentData.headDoctorName,
      },
      select: {
        id: true,
      },
    });

    for (const roomData of departmentData.rooms) {
      const room = await prisma.hospitalRoom.upsert({
        where: {
          departmentId_number: {
            departmentId: department.id,
            number: roomData.number,
          },
        },
        update: {
          type: roomData.type,
        },
        create: {
          departmentId: department.id,
          number: roomData.number,
          type: roomData.type,
        },
        select: {
          id: true,
        },
      });

      for (const bedData of roomData.beds) {
        await prisma.hospitalBed.upsert({
          where: {
            roomId_number: {
              roomId: room.id,
              number: bedData.number,
            },
          },
          update: {
            status: bedData.status,
            patientName: bedData.patientName,
          },
          create: {
            roomId: room.id,
            number: bedData.number,
            status: bedData.status,
            patientName: bedData.patientName,
          },
        });
      }
    }
  }
}

async function seedMedicalRecords() {
  const records = [
    {
      code: 'MR-001',
      patientPesel: '12345678901',
      doctorName: 'dr Anna Nowak',
      departmentName: 'Oddział Kardiologii',
      type: 'VISIT' as const,
      title: 'Wizyta kontrolna po hospitalizacji',
      createdAt: new Date('2026-06-10T00:00:00.000Z'),
      status: 'FINAL' as const,
      isSensitive: true,
      description:
        'Pacjent zgłosił się na kontrolę po hospitalizacji. Zalecono dalszą obserwację, kontrolę ciśnienia oraz kontynuację leczenia.',
      auditTrail: [
        {
          actorName: 'dr Anna Nowak',
          action: 'CREATE' as const,
          accessedAt: new Date('2026-06-10T09:15:00.000Z'),
          reason: 'Utworzenie wpisu po wizycie kontrolnej.',
        },
        {
          actorName: 'Katarzyna Wójcik',
          action: 'VIEW' as const,
          accessedAt: new Date('2026-06-10T10:20:00.000Z'),
          reason: 'Weryfikacja zaleceń pielęgniarskich.',
        },
      ],
    },
    {
      code: 'MR-002',
      patientPesel: '98765432109',
      doctorName: 'dr Piotr Zieliński',
      departmentName: 'Oddział Neurologii',
      type: 'DIAGNOSIS' as const,
      title: 'Rozpoznanie neurologiczne',
      createdAt: new Date('2026-06-09T00:00:00.000Z'),
      status: 'FINAL' as const,
      isSensitive: true,
      description:
        'Opis rozpoznania neurologicznego pacjentki. Dokument zawiera dane wrażliwe i wymaga pełnego audytu dostępu.',
      auditTrail: [
        {
          actorName: 'dr Piotr Zieliński',
          action: 'CREATE' as const,
          accessedAt: new Date('2026-06-09T13:40:00.000Z'),
          reason: 'Utworzenie rozpoznania.',
        },
      ],
    },
    {
      code: 'MR-003',
      patientPesel: '11223344556',
      doctorName: 'dr Anna Nowak',
      departmentName: 'Oddział Kardiologii',
      type: 'LAB_RESULT' as const,
      title: 'Wyniki badań laboratoryjnych',
      createdAt: new Date('2026-06-08T00:00:00.000Z'),
      status: 'DRAFT' as const,
      isSensitive: true,
      description:
        'Wstępny wpis dotyczący wyników badań laboratoryjnych. Dokument pozostaje w statusie roboczym.',
      auditTrail: [
        {
          actorName: 'dr Anna Nowak',
          action: 'CREATE' as const,
          accessedAt: new Date('2026-06-08T08:55:00.000Z'),
          reason: 'Dodanie wyników badań.',
        },
      ],
    },
    {
      code: 'MR-004',
      patientPesel: '12345678901',
      doctorName: 'dr Anna Nowak',
      departmentName: 'Oddział Kardiologii',
      type: 'PRESCRIPTION' as const,
      title: 'Recepta po konsultacji',
      createdAt: new Date('2026-06-07T00:00:00.000Z'),
      status: 'ARCHIVED' as const,
      isSensitive: true,
      description:
        'Archiwalny wpis recepty wystawionej po konsultacji kardiologicznej.',
      auditTrail: [
        {
          actorName: 'dr Anna Nowak',
          action: 'CREATE' as const,
          accessedAt: new Date('2026-06-07T11:30:00.000Z'),
          reason: 'Wystawienie recepty.',
        },
        {
          actorName: 'Michał Kamiński',
          action: 'EXPORT' as const,
          accessedAt: new Date('2026-06-07T12:05:00.000Z'),
          reason: 'Test eksportu dokumentu do systemu EDM.',
        },
      ],
    },
  ];

  for (const recordData of records) {
    const patient = await prisma.patient.findUnique({
      where: {
        pesel: recordData.patientPesel,
      },
      select: {
        id: true,
      },
    });

    if (!patient) {
      throw new Error(`Brak pacjenta o PESEL ${recordData.patientPesel}`);
    }

    const record = await prisma.medicalRecord.upsert({
      where: {
        code: recordData.code,
      },
      update: {
        patientId: patient.id,
        doctorName: recordData.doctorName,
        departmentName: recordData.departmentName,
        type: recordData.type,
        title: recordData.title,
        createdAt: recordData.createdAt,
        status: recordData.status,
        isSensitive: recordData.isSensitive,
        description: recordData.description,
      },
      create: {
        code: recordData.code,
        patientId: patient.id,
        doctorName: recordData.doctorName,
        departmentName: recordData.departmentName,
        type: recordData.type,
        title: recordData.title,
        createdAt: recordData.createdAt,
        status: recordData.status,
        isSensitive: recordData.isSensitive,
        description: recordData.description,
      },
      select: {
        id: true,
      },
    });

    await prisma.medicalRecordAuditEntry.deleteMany({
      where: {
        medicalRecordId: record.id,
      },
    });

    for (const auditEntry of recordData.auditTrail) {
      await prisma.medicalRecordAuditEntry.create({
        data: {
          medicalRecordId: record.id,
          actorName: auditEntry.actorName,
          action: auditEntry.action,
          accessedAt: auditEntry.accessedAt,
          reason: auditEntry.reason,
        },
      });
    }
  }
}

async function seedDocuments() {
  const documents = [
    {
      code: 'DOC-001',
      patientPesel: '12345678901',
      type: 'MEDICAL_SCAN' as const,
      fileName: 'ekg_jan_kowalski_2026_06_10.pdf',
      status: 'VERIFIED' as const,
      uploadedBy: 'dr Anna Nowak',
      uploadedAt: new Date('2026-06-10T09:45:00.000Z'),
      isSensitive: true,
    },
    {
      code: 'DOC-002',
      patientPesel: '98765432109',
      type: 'LAB_ATTACHMENT' as const,
      fileName: 'wyniki_laboratoryjne_maria_wisniewska.pdf',
      status: 'UPLOADED' as const,
      uploadedBy: 'Katarzyna Wójcik',
      uploadedAt: new Date('2026-06-10T10:30:00.000Z'),
      isSensitive: true,
    },
    {
      code: 'DOC-003',
      patientPesel: '11223344556',
      type: 'CONSENT' as const,
      fileName: 'zgoda_na_przetwarzanie_danych.pdf',
      status: 'VERIFIED' as const,
      uploadedBy: 'Recepcja',
      uploadedAt: new Date('2026-06-09T14:15:00.000Z'),
      isSensitive: false,
    },
    {
      code: 'DOC-004',
      patientPesel: '12345678901',
      type: 'DISCHARGE_FILE' as const,
      fileName: 'wypis_szpitalny_jan_kowalski.pdf',
      status: 'ARCHIVED' as const,
      uploadedBy: 'dr Anna Nowak',
      uploadedAt: new Date('2026-06-08T12:10:00.000Z'),
      isSensitive: true,
    },
  ];

  for (const documentData of documents) {
    const patient = await prisma.patient.findUnique({
      where: {
        pesel: documentData.patientPesel,
      },
      select: {
        id: true,
      },
    });

    if (!patient) {
      throw new Error(`Brak pacjenta o PESEL ${documentData.patientPesel}`);
    }

    await prisma.patientDocument.upsert({
      where: {
        code: documentData.code,
      },
      update: {
        patientId: patient.id,
        type: documentData.type,
        fileName: documentData.fileName,
        status: documentData.status,
        uploadedBy: documentData.uploadedBy,
        uploadedAt: documentData.uploadedAt,
        isSensitive: documentData.isSensitive,
      },
      create: {
        code: documentData.code,
        patientId: patient.id,
        type: documentData.type,
        fileName: documentData.fileName,
        status: documentData.status,
        uploadedBy: documentData.uploadedBy,
        uploadedAt: documentData.uploadedAt,
        isSensitive: documentData.isSensitive,
      },
    });
  }
}

async function main() {
  await seedStaffUsers();
  await seedPatients();
  await seedEmployees();
  await seedHospitalStructure();
  await seedMedicalRecords();
  await seedDocuments();

  console.log('Seed zakończony.');
  console.log('');
  console.log('Konta administracyjne:');
  console.log('admin@supermed.pl / Admin1234!');
  console.log('director@supermed.pl / Director1234!');
  console.log('employee@supermed.pl / Employee1234!');
  console.log('');
  console.log('Konta pacjentów:');
  console.log('jan.kowalski@supermed.pl / Patient1234!');
  console.log('maria.wisniewska@supermed.pl / Patient1234!');
  console.log('tomasz.wojcik@supermed.pl / Patient1234!');
  console.log('');
  console.log('Konta pracowników z listy:');
  console.log('anna.nowak@supermed.pl / Employee1234!');
  console.log('piotr.zielinski@supermed.pl / Employee1234!');
  console.log('katarzyna.wojcik@supermed.pl / Employee1234!');
  console.log('michal.kaminski@supermed.pl / Admin1234!');
  console.log('ewa.lewandowska@supermed.pl / Director1234!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
