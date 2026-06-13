import {
  Body,
  Controller,
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
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';
import type { DoctorOptionRow, EmployeeResponse } from './employees.service';

interface RequestWithUser {
  user: JwtPayload;
  ip?: string;
  headers: {
    'x-forwarded-for'?: string | string[];
  };
}

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Roles('ADMIN', 'DIRECTOR')
  getEmployees(): Promise<EmployeeResponse[]> {
    return this.employeesService.getEmployees();
  }

  @Get('doctors/options')
  @Roles('ADMIN', 'DIRECTOR', 'EMPLOYEE')
  getActiveDoctorOptions(): Promise<DoctorOptionRow[]> {
    return this.employeesService.getActiveDoctorOptions();
  }

  @Post()
  @Roles('ADMIN', 'DIRECTOR')
  createEmployee(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Req() request: RequestWithUser,
  ): Promise<EmployeeResponse> {
    return this.employeesService.createEmployee(
      createEmployeeDto,
      request.user,
      this.getIpAddress(request),
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'DIRECTOR')
  getEmployeeById(
    @Param('id', ParseIntPipe) employeeId: number,
  ): Promise<EmployeeResponse> {
    return this.employeesService.getEmployeeById(employeeId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DIRECTOR')
  updateEmployee(
    @Param('id', ParseIntPipe) employeeId: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Req() request: RequestWithUser,
  ): Promise<EmployeeResponse> {
    return this.employeesService.updateEmployee(
      employeeId,
      updateEmployeeDto,
      request.user,
      this.getIpAddress(request),
    );
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'DIRECTOR')
  toggleEmployeeStatus(
    @Param('id', ParseIntPipe) employeeId: number,
    @Req() request: RequestWithUser,
  ): Promise<EmployeeResponse> {
    return this.employeesService.toggleEmployeeStatus(
      employeeId,
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
