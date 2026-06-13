import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type PatientDocumentWithPatient = Prisma.PatientDocumentGetPayload<{
  include: {
    patient: {
      select: {
        firstName: true;
        lastName: true;
        pesel: true;
      };
    };
  };
}>;

@Injectable()
export class DocumentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getDocuments() {
    const documents = await this.prismaService.patientDocument.findMany({
      orderBy: {
        uploadedAt: 'desc',
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            pesel: true,
          },
        },
      },
    });

    return documents.map((document) => this.mapDocument(document));
  }

  private mapDocument(document: PatientDocumentWithPatient) {
    return {
      id: document.id,
      patientName: `${document.patient.firstName} ${document.patient.lastName}`,
      patientPesel: document.patient.pesel,
      type: document.type,
      fileName: document.fileName,
      status: document.status,
      uploadedBy: document.uploadedBy,
      uploadedAt: this.formatDateTime(document.uploadedAt),
      isSensitive: document.isSensitive,
    };
  }

  private formatDateTime(value: Date): string {
    return value.toISOString().slice(0, 16).replace('T', ' ');
  }
}
