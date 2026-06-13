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
import { EmployeesService } from './employees.service';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Roles('ADMIN', 'DIRECTOR')
  getEmployees() {
    return this.employeesService.getEmployees();
  }

  @Get(':id')
  @Roles('ADMIN', 'DIRECTOR')
  getEmployeeById(@Param('id', ParseIntPipe) employeeId: number) {
    return this.employeesService.getEmployeeById(employeeId);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'DIRECTOR')
  toggleEmployeeStatus(@Param('id', ParseIntPipe) employeeId: number) {
    return this.employeesService.toggleEmployeeStatus(employeeId);
  }
}
