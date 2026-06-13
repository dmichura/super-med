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
import { CreateBedDto } from './dto/create-bed.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateBedDto } from './dto/update-bed.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import {
  HospitalStructureService,
  PatientOptionRow,
} from './hospital-structure.service';

interface RequestWithUser {
  user: JwtPayload;
  ip?: string;
  headers: {
    'x-forwarded-for'?: string | string[];
  };
}

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

  @Get('patients/options')
  @Roles('ADMIN', 'DIRECTOR')
  getPatientOptions(): Promise<PatientOptionRow[]> {
    return this.hospitalStructureService.getPatientOptions();
  }

  @Post('departments')
  @Roles('ADMIN', 'DIRECTOR')
  createDepartment(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @Req() request: RequestWithUser,
  ) {
    return this.hospitalStructureService.createDepartment(
      createDepartmentDto,
      request.user,
      this.getIpAddress(request),
    );
  }

  @Patch('departments/:departmentId')
  @Roles('ADMIN', 'DIRECTOR')
  updateDepartment(
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @Req() request: RequestWithUser,
  ) {
    return this.hospitalStructureService.updateDepartment(
      departmentId,
      updateDepartmentDto,
      request.user,
      this.getIpAddress(request),
    );
  }

  @Delete('departments/:departmentId')
  @Roles('ADMIN', 'DIRECTOR')
  deleteDepartment(
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Req() request: RequestWithUser,
  ) {
    return this.hospitalStructureService.deleteDepartment(
      departmentId,
      request.user,
      this.getIpAddress(request),
    );
  }

  @Post('departments/:departmentId/rooms')
  @Roles('ADMIN', 'DIRECTOR')
  createRoom(
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Body() createRoomDto: CreateRoomDto,
    @Req() request: RequestWithUser,
  ) {
    return this.hospitalStructureService.createRoom(
      departmentId,
      createRoomDto,
      request.user,
      this.getIpAddress(request),
    );
  }

  @Patch('rooms/:roomId')
  @Roles('ADMIN', 'DIRECTOR')
  updateRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() updateRoomDto: UpdateRoomDto,
    @Req() request: RequestWithUser,
  ) {
    return this.hospitalStructureService.updateRoom(
      roomId,
      updateRoomDto,
      request.user,
      this.getIpAddress(request),
    );
  }

  @Delete('rooms/:roomId')
  @Roles('ADMIN', 'DIRECTOR')
  deleteRoom(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Req() request: RequestWithUser,
  ) {
    return this.hospitalStructureService.deleteRoom(
      roomId,
      request.user,
      this.getIpAddress(request),
    );
  }

  @Post('rooms/:roomId/beds')
  @Roles('ADMIN', 'DIRECTOR')
  createBed(
    @Param('roomId', ParseIntPipe) roomId: number,
    @Body() createBedDto: CreateBedDto,
    @Req() request: RequestWithUser,
  ) {
    return this.hospitalStructureService.createBed(
      roomId,
      createBedDto,
      request.user,
      this.getIpAddress(request),
    );
  }

  @Patch('beds/:bedId')
  @Roles('ADMIN', 'DIRECTOR')
  updateBed(
    @Param('bedId', ParseIntPipe) bedId: number,
    @Body() updateBedDto: UpdateBedDto,
    @Req() request: RequestWithUser,
  ) {
    return this.hospitalStructureService.updateBed(
      bedId,
      updateBedDto,
      request.user,
      this.getIpAddress(request),
    );
  }

  @Delete('beds/:bedId')
  @Roles('ADMIN', 'DIRECTOR')
  deleteBed(
    @Param('bedId', ParseIntPipe) bedId: number,
    @Req() request: RequestWithUser,
  ) {
    return this.hospitalStructureService.deleteBed(
      bedId,
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
