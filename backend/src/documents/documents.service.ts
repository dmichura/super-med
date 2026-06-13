import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { DocumentStatus, DocumentType, Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

export interface UploadedDocumentFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

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

type PatientDocumentFileData = {
  id: number;
  code: string;
  fileName: string;
};

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

export interface DocumentDownloadInfo {
  filePath: string;
  fileName: string;
  mimeType: string;
}

@Injectable()
export class DocumentsService {
  private readonly documentsUploadDirectory = join(
    process.cwd(),
    'uploads',
    'documents',
  );

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

  async createDocumentWithFile(
    createDocumentDto: CreateDocumentDto,
    file: UploadedDocumentFile | undefined,
    actor: JwtPayload,
  ): Promise<PatientDocumentResponse> {
    if (!file) {
      throw new BadRequestException('Wybierz plik dokumentu.');
    }

    const patient = await this.prismaService.patient.findUnique({
      where: {
        id: createDocumentDto.patientId,
      },
    });

    if (!patient) {
      throw new NotFoundException('Nie odnaleziono pacjenta.');
    }

    const code = `DOC-${randomUUID()}`;
    const fileName = this.normalizeFileName(file.originalname);

    await this.ensureUploadDirectoryExists();

    const filePath = this.getStorageFilePath(code);
    await writeFile(filePath, file.buffer);

    try {
      const document = await this.prismaService.patientDocument.create({
        data: {
          code,
          patient: {
            connect: {
              id: createDocumentDto.patientId,
            },
          },
          type: createDocumentDto.type,
          fileName,
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
    } catch (error) {
      await this.removeFileIfExists(filePath);
      throw error;
    }
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

    const data = await this.buildDocumentUpdateData(updateDocumentDto);

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

  async updateDocumentWithOptionalFile(
    documentId: number,
    updateDocumentDto: UpdateDocumentDto,
    file: UploadedDocumentFile | undefined,
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

    const data = await this.buildDocumentUpdateData(updateDocumentDto);

    if (file) {
      await this.ensureUploadDirectoryExists();

      const filePath = this.getStorageFilePath(document.code);
      await writeFile(filePath, file.buffer);

      data.fileName = this.normalizeFileName(file.originalname);
      data.uploadedAt = new Date();
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

    await this.removeFileIfExists(this.getStorageFilePath(document.code));

    return this.getDocuments();
  }

  async getDocumentDownloadInfo(
    documentId: number,
  ): Promise<DocumentDownloadInfo> {
    const document = await this.prismaService.patientDocument.findUnique({
      where: {
        id: documentId,
      },
      select: {
        id: true,
        code: true,
        fileName: true,
      },
    });

    if (!document) {
      throw new NotFoundException('Nie odnaleziono dokumentu.');
    }

    const filePath = this.getStorageFilePath(document.code);

    if (!existsSync(filePath)) {
      throw new NotFoundException(
        'Plik fizyczny nie istnieje. Ten dokument ma tylko metadane.',
      );
    }

    return {
      filePath,
      fileName: document.fileName,
      mimeType: this.getMimeType(document.fileName),
    };
  }

  private async buildDocumentUpdateData(
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<Prisma.PatientDocumentUpdateInput> {
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

    return data;
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

  private async ensureUploadDirectoryExists(): Promise<void> {
    await mkdir(this.documentsUploadDirectory, {
      recursive: true,
    });
  }

  private getStorageFilePath(code: PatientDocumentFileData['code']): string {
    return join(this.documentsUploadDirectory, code);
  }

  private async removeFileIfExists(filePath: string): Promise<void> {
    if (existsSync(filePath)) {
      await rm(filePath, {
        force: true,
      });
    }
  }

  private normalizeFileName(fileName: string): string {
    const normalizedPath = fileName.replace(/\\/g, '/');
    const normalizedFileName = basename(normalizedPath).trim();

    if (!normalizedFileName) {
      return `dokument-${Date.now()}`;
    }

    return normalizedFileName;
  }

  private getMimeType(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop();

    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      txt: 'text/plain',
      csv: 'text/csv',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    return extension
      ? (mimeTypes[extension] ?? 'application/octet-stream')
      : 'application/octet-stream';
  }

  private formatDateTime(value: Date): string {
    return value.toISOString().slice(0, 16).replace('T', ' ');
  }
}
