import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { HospitalStructureService } from './hospital-structure.service';

@Controller('hospital-structure')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HospitalStructureController {
  constructor(
    private readonly hospitalStructureService: HospitalStructureService,
  ) {}

  @Get('departments')
  @Roles('ADMIN', 'DIRECTOR', 'EMPLOYEE')
  getDepartments() {
    return this.hospitalStructureService.getDepartments();
  }
}
