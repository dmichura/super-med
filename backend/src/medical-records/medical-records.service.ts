import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { AuditService } from '../audit/audit.service';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

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
  constructor(
    private readonly prismaService: PrismaService,
    private readonly auditService: AuditService,
  ) {}

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

  async createMedicalRecord(
    createMedicalRecordDto: CreateMedicalRecordDto,
    actor: JwtPayload,
    ipAddress: string,
  ) {
    const patient = await this.prismaService.patient.findUnique({
      where: {
        id: createMedicalRecordDto.patientId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Nie odnaleziono pacjenta.');
    }

    const record = await this.prismaService.$transaction(async (tx) => {
      const createdRecord = await tx.medicalRecord.create({
        data: {
          code: `MR-${randomUUID()}`,
          patient: {
            connect: {
              id: patient.id,
            },
          },
          doctorName: createMedicalRecordDto.doctorName.trim(),
          departmentName: createMedicalRecordDto.departmentName.trim(),
          type: createMedicalRecordDto.type,
          title: createMedicalRecordDto.title.trim(),
          createdAt: new Date(),
          status: createMedicalRecordDto.status ?? 'DRAFT',
          isSensitive: createMedicalRecordDto.isSensitive ?? true,
          description: createMedicalRecordDto.description.trim(),
        },
      });

      await tx.medicalRecordAuditEntry.create({
        data: {
          medicalRecordId: createdRecord.id,
          actorName: actor.email,
          action: 'CREATE',
          accessedAt: new Date(),
          reason: 'Utworzenie wpisu dokumentacji medycznej.',
        },
      });

      return tx.medicalRecord.findUniqueOrThrow({
        where: {
          id: createdRecord.id,
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
    });

    const mappedRecord = this.mapMedicalRecord(record);

    await this.auditService.createAuditEvent({
      actorName: actor.email,
      actorRole: actor.role,
      action: 'CREATE',
      resourceType: 'MEDICAL_RECORD',
      resourceName: mappedRecord.title,
      ipAddress,
      result: 'SUCCESS',
      reason: `Utworzenie wpisu medycznego dla pacjenta ${mappedRecord.patientName}.`,
    });

    return mappedRecord;
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

  async updateMedicalRecord(
    recordId: number,
    updateMedicalRecordDto: UpdateMedicalRecordDto,
    actor: JwtPayload,
    ipAddress: string,
  ) {
    const record = await this.prismaService.medicalRecord.findUnique({
      where: {
        id: recordId,
      },
    });

    if (!record) {
      throw new NotFoundException(
        'Nie odnaleziono wpisu dokumentacji medycznej.',
      );
    }

    if (updateMedicalRecordDto.patientId !== undefined) {
      const patient = await this.prismaService.patient.findUnique({
        where: {
          id: updateMedicalRecordDto.patientId,
        },
      });

      if (!patient) {
        throw new NotFoundException('Nie odnaleziono pacjenta.');
      }
    }

    const data: Prisma.MedicalRecordUpdateInput = {};

    if (updateMedicalRecordDto.patientId !== undefined) {
      data.patient = {
        connect: {
          id: updateMedicalRecordDto.patientId,
        },
      };
    }

    if (updateMedicalRecordDto.doctorName !== undefined) {
      data.doctorName = updateMedicalRecordDto.doctorName.trim();
    }

    if (updateMedicalRecordDto.departmentName !== undefined) {
      data.departmentName = updateMedicalRecordDto.departmentName.trim();
    }

    if (updateMedicalRecordDto.type !== undefined) {
      data.type = updateMedicalRecordDto.type;
    }

    if (updateMedicalRecordDto.title !== undefined) {
      data.title = updateMedicalRecordDto.title.trim();
    }

    if (updateMedicalRecordDto.status !== undefined) {
      data.status = updateMedicalRecordDto.status;
    }

    if (updateMedicalRecordDto.isSensitive !== undefined) {
      data.isSensitive = updateMedicalRecordDto.isSensitive;
    }

    if (updateMedicalRecordDto.description !== undefined) {
      data.description = updateMedicalRecordDto.description.trim();
    }

    const updatedRecord = await this.prismaService.$transaction(async (tx) => {
      await tx.medicalRecord.update({
        where: {
          id: recordId,
        },
        data,
      });

      await tx.medicalRecordAuditEntry.create({
        data: {
          medicalRecordId: recordId,
          actorName: actor.email,
          action: 'UPDATE',
          accessedAt: new Date(),
          reason: 'Aktualizacja wpisu dokumentacji medycznej.',
        },
      });

      return tx.medicalRecord.findUniqueOrThrow({
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
    });

    const mappedRecord = this.mapMedicalRecord(updatedRecord);

    await this.auditService.createAuditEvent({
      actorName: actor.email,
      actorRole: actor.role,
      action: 'UPDATE',
      resourceType: 'MEDICAL_RECORD',
      resourceName: mappedRecord.title,
      ipAddress,
      result: 'SUCCESS',
      reason: `Aktualizacja wpisu medycznego pacjenta ${mappedRecord.patientName}.`,
    });

    return mappedRecord;
  }

  async deleteMedicalRecord(
    recordId: number,
    actor: JwtPayload,
    ipAddress: string,
  ) {
    const record = await this.prismaService.medicalRecord.findUnique({
      where: {
        id: recordId,
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException(
        'Nie odnaleziono wpisu dokumentacji medycznej.',
      );
    }

    await this.prismaService.medicalRecord.delete({
      where: {
        id: recordId,
      },
    });

    await this.auditService.createAuditEvent({
      actorName: actor.email,
      actorRole: actor.role,
      action: 'DELETE',
      resourceType: 'MEDICAL_RECORD',
      resourceName: record.title,
      ipAddress,
      result: 'SUCCESS',
      reason: `Usunięcie wpisu medycznego pacjenta ${record.patient.firstName} ${record.patient.lastName}.`,
    });

    return this.getMedicalRecords();
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
