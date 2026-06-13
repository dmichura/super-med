import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'node:fs';
import type { Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import {
  DocumentsService,
  type PatientDocumentResponse,
  type UploadedDocumentFile,
} from './documents.service';

interface RequestWithUser {
  user: JwtPayload;
}

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @Roles('ADMIN', 'EMPLOYEE')
  getDocuments(): Promise<PatientDocumentResponse[]> {
    return this.documentsService.getDocuments();
  }

  @Post()
  @Roles('ADMIN', 'EMPLOYEE')
  createDocument(
    @Body() createDocumentDto: CreateDocumentDto,
    @Req() request: RequestWithUser,
  ): Promise<PatientDocumentResponse> {
    return this.documentsService.createDocument(
      createDocumentDto,
      request.user,
    );
  }

  @Post('upload')
  @Roles('ADMIN', 'EMPLOYEE')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  createDocumentWithFile(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: UploadedDocumentFile | undefined,
    @Req() request: RequestWithUser,
  ): Promise<PatientDocumentResponse> {
    return this.documentsService.createDocumentWithFile(
      createDocumentDto,
      file,
      request.user,
    );
  }

  @Get(':id/download')
  @Roles('ADMIN', 'EMPLOYEE')
  async downloadDocument(
    @Param('id', ParseIntPipe) documentId: number,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const downloadInfo =
      await this.documentsService.getDocumentDownloadInfo(documentId);

    response.set({
      'Content-Type': downloadInfo.mimeType,
      'Content-Disposition': this.getContentDisposition(downloadInfo.fileName),
    });

    return new StreamableFile(createReadStream(downloadInfo.filePath));
  }

  @Patch(':id')
  @Roles('ADMIN', 'EMPLOYEE')
  updateDocument(
    @Param('id', ParseIntPipe) documentId: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ): Promise<PatientDocumentResponse> {
    return this.documentsService.updateDocument(documentId, updateDocumentDto);
  }

  @Patch(':id/upload')
  @Roles('ADMIN', 'EMPLOYEE')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  updateDocumentWithOptionalFile(
    @Param('id', ParseIntPipe) documentId: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @UploadedFile() file: UploadedDocumentFile | undefined,
  ): Promise<PatientDocumentResponse> {
    return this.documentsService.updateDocumentWithOptionalFile(
      documentId,
      updateDocumentDto,
      file,
    );
  }

  @Delete(':id')
  @Roles('ADMIN', 'EMPLOYEE')
  deleteDocument(
    @Param('id', ParseIntPipe) documentId: number,
  ): Promise<PatientDocumentResponse[]> {
    return this.documentsService.deleteDocument(documentId);
  }

  private getContentDisposition(fileName: string): string {
    const fallbackFileName = fileName.replace(/["\\]/g, '_');

    return `attachment; filename="${fallbackFileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
  }
}
