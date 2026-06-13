import { Injectable, NotFoundException } from '@nestjs/common';
import type { DocumentStatus, DocumentType, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

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

export interface PatientDocumentResponse {
  id: number;
  patientName: string;
  patientPesel: string;
  type: DocumentType;
  fileName: string;
  status: DocumentStatus;
  uploadedBy: string;
  uploadedAt: string;
  isSensitive: boolean;
}

@Injectable()
export class DocumentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getDocuments(): Promise<PatientDocumentResponse[]> {
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

  async createDocument(
    createDocumentDto: CreateDocumentDto,
    actor: JwtPayload,
  ): Promise<PatientDocumentResponse> {
    const patient = await this.prismaService.patient.findUnique({
      where: {
        id: createDocumentDto.patientId,
      },
    });

    if (!patient) {
      throw new NotFoundException('Nie odnaleziono pacjenta.');
    }

    const document = await this.prismaService.patientDocument.create({
      data: {
        code: `DOC-${randomUUID()}`,
        patient: {
          connect: {
            id: createDocumentDto.patientId,
          },
        },
        type: createDocumentDto.type,
        fileName: createDocumentDto.fileName.trim(),
        status: createDocumentDto.status ?? 'UPLOADED',
        uploadedBy: actor.email,
        uploadedAt: new Date(),
        isSensitive: createDocumentDto.isSensitive ?? true,
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

    return this.mapDocument(document);
  }

  async updateDocument(
    documentId: number,
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<PatientDocumentResponse> {
    const document = await this.prismaService.patientDocument.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!document) {
      throw new NotFoundException('Nie odnaleziono dokumentu.');
    }

    if (updateDocumentDto.patientId !== undefined) {
      const patient = await this.prismaService.patient.findUnique({
        where: {
          id: updateDocumentDto.patientId,
        },
      });

      if (!patient) {
        throw new NotFoundException('Nie odnaleziono pacjenta.');
      }
    }

    const data: Prisma.PatientDocumentUpdateInput = {};

    if (updateDocumentDto.patientId !== undefined) {
      data.patient = {
        connect: {
          id: updateDocumentDto.patientId,
        },
      };
    }

    if (updateDocumentDto.type !== undefined) {
      data.type = updateDocumentDto.type;
    }

    if (updateDocumentDto.fileName !== undefined) {
      data.fileName = updateDocumentDto.fileName.trim();
    }

    if (updateDocumentDto.status !== undefined) {
      data.status = updateDocumentDto.status;
    }

    if (updateDocumentDto.isSensitive !== undefined) {
      data.isSensitive = updateDocumentDto.isSensitive;
    }

    const updatedDocument = await this.prismaService.patientDocument.update({
      where: {
        id: documentId,
      },
      data,
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

    return this.mapDocument(updatedDocument);
  }

  async deleteDocument(documentId: number): Promise<PatientDocumentResponse[]> {
    const document = await this.prismaService.patientDocument.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!document) {
      throw new NotFoundException('Nie odnaleziono dokumentu.');
    }

    await this.prismaService.patientDocument.delete({
      where: {
        id: documentId,
      },
    });

    return this.getDocuments();
  }

  private mapDocument(
    document: PatientDocumentWithPatient,
  ): PatientDocumentResponse {
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
