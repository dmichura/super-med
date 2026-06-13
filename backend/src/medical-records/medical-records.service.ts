import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type MedicalRecordWithRelations = Prisma.MedicalRecordGetPayload<{
  include: {
    patient: {
      select: {
        firstName: true;
        lastName: true;
        pesel: true;
      };
    };
    auditTrail: true;
  };
}>;

@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getMedicalRecords() {
    const records = await this.prismaService.medicalRecord.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            pesel: true,
          },
        },
        auditTrail: {
          orderBy: {
            accessedAt: 'asc',
          },
        },
      },
    });

    return records.map((record) => this.mapMedicalRecord(record));
  }

  async getMedicalRecordById(recordId: number) {
    const record = await this.prismaService.medicalRecord.findUnique({
      where: {
        id: recordId,
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            pesel: true,
          },
        },
        auditTrail: {
          orderBy: {
            accessedAt: 'asc',
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException(
        'Nie odnaleziono wpisu dokumentacji medycznej.',
      );
    }

    return this.mapMedicalRecord(record);
  }

  private mapMedicalRecord(record: MedicalRecordWithRelations) {
    return {
      id: record.id,
      patientName: `${record.patient.firstName} ${record.patient.lastName}`,
      patientPesel: record.patient.pesel,
      doctorName: record.doctorName,
      departmentName: record.departmentName,
      type: record.type,
      title: record.title,
      createdAt: this.formatDate(record.createdAt),
      status: record.status,
      isSensitive: record.isSensitive,
      description: record.description,
      auditTrail: record.auditTrail.map((entry) => ({
        id: entry.id,
        actorName: entry.actorName,
        action: entry.action,
        accessedAt: this.formatDateTime(entry.accessedAt),
        reason: entry.reason,
      })),
    };
  }

  private formatDate(value: Date): string {
    return value.toISOString().slice(0, 10);
  }

  private formatDateTime(value: Date): string {
    return value.toISOString().slice(0, 16).replace('T', ' ');
  }
}
