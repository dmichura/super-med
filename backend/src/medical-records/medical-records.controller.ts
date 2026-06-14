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
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecordsService } from './medical-records.service';

interface RequestWithUser {
  user: JwtPayload;
  ip?: string;
  headers: {
    'x-forwarded-for'?: string | string[];
  };
}

@Controller('medical-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Get()
  @Roles('ADMIN', 'EMPLOYEE')
  getMedicalRecords() {
    return this.medicalRecordsService.getMedicalRecords();
  }

  @Post()
  @Roles('ADMIN', 'EMPLOYEE')
  createMedicalRecord(
    @Body() createMedicalRecordDto: CreateMedicalRecordDto,
    @Req() request: RequestWithUser,
  ) {
    return this.medicalRecordsService.createMedicalRecord(
      createMedicalRecordDto,
      request.user,
      this.getIpAddress(request),
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'EMPLOYEE')
  getMedicalRecordById(@Param('id', ParseIntPipe) recordId: number) {
    return this.medicalRecordsService.getMedicalRecordById(recordId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'EMPLOYEE')
  updateMedicalRecord(
    @Param('id', ParseIntPipe) recordId: number,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
    @Req() request: RequestWithUser,
  ) {
    return this.medicalRecordsService.updateMedicalRecord(
      recordId,
      updateMedicalRecordDto,
      request.user,
      this.getIpAddress(request),
    );
  }

  @Delete(':id')
  @Roles('ADMIN', 'EMPLOYEE')
  deleteMedicalRecord(
    @Param('id', ParseIntPipe) recordId: number,
    @Req() request: RequestWithUser,
  ) {
    return this.medicalRecordsService.deleteMedicalRecord(
      recordId,
      request.user,
      this.getIpAddress(request),
    );
  }

  private getIpAddress(request: RequestWithUser): string {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (Array.isArray(forwardedFor)) {
      return forwardedFor[0] ?? 'unknown';
    }

    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    return request.ip ?? 'unknown';
  }
}
