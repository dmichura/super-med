import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
