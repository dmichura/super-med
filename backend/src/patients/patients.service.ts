import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

interface DoctorNameRow {
  firstName: string;
  lastName: string;
}

@Injectable()
export class PatientsService {
  constructor(private readonly prismaService: PrismaService) {}

  getPatients() {
    return this.prismaService.patient.findMany({
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        pesel: true,
        email: true,
        isAuthorized: true,
        assignedDoctorName: true,
        isActive: true,
      },
    });
  }

  async createPatient(createPatientDto: CreatePatientDto) {
    const email = createPatientDto.email.trim().toLowerCase();

    const existingPatient = await this.prismaService.patient.findFirst({
      where: {
        OR: [
          {
            email,
          },
          {
            pesel: createPatientDto.pesel,
          },
        ],
      },
    });

    if (existingPatient) {
      throw new ConflictException(
        'Pacjent z tym adresem email albo numerem PESEL już istnieje.',
      );
    }

    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'Ten adres email jest już używany przez konto użytkownika.',
      );
    }

    return this.prismaService.patient.create({
      data: {
        firstName: createPatientDto.firstName,
        lastName: createPatientDto.lastName,
        pesel: createPatientDto.pesel,
        email,
        assignedDoctorName: createPatientDto.assignedDoctorName?.trim() || null,
        isAuthorized: false,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        pesel: true,
        email: true,
        isAuthorized: true,
        assignedDoctorName: true,
        isActive: true,
      },
    });
  }

  async getPatientById(patientId: number) {
    const patient = await this.prismaService.patient.findUnique({
      where: {
        id: patientId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        pesel: true,
        email: true,
        isAuthorized: true,
        assignedDoctorName: true,
        isActive: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Nie odnaleziono pacjenta.');
    }

    return patient;
  }

  async updatePatient(patientId: number, updatePatientDto: UpdatePatientDto) {
    const patient = await this.prismaService.patient.findUnique({
      where: {
        id: patientId,
      },
    });

    if (!patient) {
      throw new NotFoundException('Nie odnaleziono pacjenta.');
    }

    const nextEmail = updatePatientDto.email?.trim().toLowerCase();

    if (nextEmail && nextEmail !== patient.email) {
      const existingPatientWithEmail =
        await this.prismaService.patient.findFirst({
          where: {
            email: nextEmail,
            id: {
              not: patientId,
            },
          },
        });

      if (existingPatientWithEmail) {
        throw new ConflictException(
          'Pacjent z tym adresem email już istnieje.',
        );
      }

      const existingUser = await this.prismaService.user.findUnique({
        where: {
          email: nextEmail,
        },
      });

      if (existingUser && existingUser.id !== patient.userId) {
        throw new ConflictException(
          'Ten adres email jest już używany przez inne konto użytkownika.',
        );
      }
    }

    if (updatePatientDto.pesel && updatePatientDto.pesel !== patient.pesel) {
      const existingPatientWithPesel =
        await this.prismaService.patient.findFirst({
          where: {
            pesel: updatePatientDto.pesel,
            id: {
              not: patientId,
            },
          },
        });

      if (existingPatientWithPesel) {
        throw new ConflictException(
          'Pacjent z tym numerem PESEL już istnieje.',
        );
      }
    }

    const data: Prisma.PatientUpdateInput = {};

    if (updatePatientDto.firstName !== undefined) {
      data.firstName = updatePatientDto.firstName;
    }

    if (updatePatientDto.lastName !== undefined) {
      data.lastName = updatePatientDto.lastName;
    }

    if (updatePatientDto.pesel !== undefined) {
      data.pesel = updatePatientDto.pesel;
    }

    if (nextEmail !== undefined) {
      data.email = nextEmail;
    }

    if (updatePatientDto.assignedDoctorName !== undefined) {
      data.assignedDoctorName =
        updatePatientDto.assignedDoctorName?.trim() || null;
    }

    if (updatePatientDto.isActive !== undefined) {
      data.isActive = updatePatientDto.isActive;
    }

    const updatedPatient = await this.prismaService.$transaction(async (tx) => {
      const updated = await tx.patient.update({
        where: {
          id: patientId,
        },
        data,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          pesel: true,
          email: true,
          isAuthorized: true,
          assignedDoctorName: true,
          isActive: true,
        },
      });

      if (patient.userId && nextEmail !== undefined) {
        await tx.user.update({
          where: {
            id: patient.userId,
          },
          data: {
            email: nextEmail,
          },
        });
      }

      if (patient.userId && updatePatientDto.isActive !== undefined) {
        await tx.user.update({
          where: {
            id: patient.userId,
          },
          data: {
            status: updatePatientDto.isActive
              ? patient.isAuthorized
                ? 'ACTIVE'
                : 'PENDING_VERIFICATION'
              : 'INACTIVE',
          },
        });
      }

      return updated;
    });

    return updatedPatient;
  }

  async authorizePatient(patientId: number) {
    const patient = await this.prismaService.patient.findUnique({
      where: {
        id: patientId,
      },
    });

    if (!patient) {
      throw new NotFoundException('Nie odnaleziono pacjenta.');
    }

    const updatedPatient = await this.prismaService.$transaction(async (tx) => {
      const updated = await tx.patient.update({
        where: {
          id: patientId,
        },
        data: {
          isAuthorized: true,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          pesel: true,
          email: true,
          isAuthorized: true,
          assignedDoctorName: true,
          isActive: true,
        },
      });

      if (patient.userId) {
        await tx.user.update({
          where: {
            id: patient.userId,
          },
          data: {
            status: 'ACTIVE',
          },
        });
      }

      return updated;
    });

    return updatedPatient;
  }
}
