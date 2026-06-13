import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { EmployeesService } from './employees.service';

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
  toggleEmployeeStatus(
    @Param('id', ParseIntPipe) employeeId: number,
    @Req() request: RequestWithUser,
  ) {
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
