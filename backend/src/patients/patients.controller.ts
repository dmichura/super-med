import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PatientsService } from './patients.service';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @Roles('ADMIN', 'EMPLOYEE')
  getPatients() {
    return this.patientsService.getPatients();
  }

  @Get(':id')
  @Roles('ADMIN', 'EMPLOYEE')
  getPatientById(@Param('id', ParseIntPipe) patientId: number) {
    return this.patientsService.getPatientById(patientId);
  }

  @Patch(':id/authorize')
  @Roles('ADMIN', 'EMPLOYEE')
  authorizePatient(@Param('id', ParseIntPipe) patientId: number) {
    return this.patientsService.authorizePatient(patientId);
  }
}
