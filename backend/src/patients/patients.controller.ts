import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
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

  @Post()
  @Roles('ADMIN', 'EMPLOYEE')
  createPatient(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.createPatient(createPatientDto);
  }

  @Get(':id')
  @Roles('ADMIN', 'EMPLOYEE')
  getPatientById(@Param('id', ParseIntPipe) patientId: number) {
    return this.patientsService.getPatientById(patientId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'EMPLOYEE')
  updatePatient(
    @Param('id', ParseIntPipe) patientId: number,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientsService.updatePatient(patientId, updatePatientDto);
  }

  @Patch(':id/authorize')
  @Roles('ADMIN', 'EMPLOYEE')
  authorizePatient(@Param('id', ParseIntPipe) patientId: number) {
    return this.patientsService.authorizePatient(patientId);
  }
}
