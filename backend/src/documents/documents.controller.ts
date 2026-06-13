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
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentsService } from './documents.service';
import type { PatientDocumentResponse } from './documents.service';

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

  @Patch(':id')
  @Roles('ADMIN', 'EMPLOYEE')
  updateDocument(
    @Param('id', ParseIntPipe) documentId: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ): Promise<PatientDocumentResponse> {
    return this.documentsService.updateDocument(documentId, updateDocumentDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'EMPLOYEE')
  deleteDocument(
    @Param('id', ParseIntPipe) documentId: number,
  ): Promise<PatientDocumentResponse[]> {
    return this.documentsService.deleteDocument(documentId);
  }
}
