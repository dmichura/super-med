import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MedicalRecordsService } from './medical-records.service';

@Controller('medical-records')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Get()
  @Roles('ADMIN', 'EMPLOYEE')
  getMedicalRecords() {
    return this.medicalRecordsService.getMedicalRecords();
  }

  @Get(':id')
  @Roles('ADMIN', 'EMPLOYEE')
  getMedicalRecordById(@Param('id', ParseIntPipe) recordId: number) {
    return this.medicalRecordsService.getMedicalRecordById(recordId);
  }
}
