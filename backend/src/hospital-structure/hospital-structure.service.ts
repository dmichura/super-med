import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBedDto } from './dto/create-bed.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateBedDto } from './dto/update-bed.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

export interface PatientOptionRow {
  id: number;
  firstName: string;
  lastName: string;
  pesel: string;
  email: string;
  isAuthorized: boolean;
}

@Injectable()
export class HospitalStructureService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getPatientOptions(): Promise<PatientOptionRow[]> {
    return this.prismaService.patient.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          lastName: 'asc',
        },
        {
          firstName: 'asc',
        },
      ],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        pesel: true,
        email: true,
        isAuthorized: true,
      },
    });
  }

  getDepartments() {
    return this.prismaService.hospitalDepartment.findMany({
      orderBy: [
        {
          floor: 'asc',
        },
        {
          name: 'asc',
        },
      ],
      select: {
        id: true,
        name: true,
        code: true,
        floor: true,
        headDoctorName: true,
        rooms: {
          orderBy: {
            number: 'asc',
          },
          select: {
            id: true,
            number: true,
            type: true,
            beds: {
              orderBy: {
                number: 'asc',
              },
              select: {
                id: true,
                number: true,
                status: true,
                patientName: true,
              },
            },
          },
        },
      },
    });
  }

  async createDepartment(
    createDepartmentDto: CreateDepartmentDto,
    actor: JwtPayload,
    ipAddress: string,
  ) {
    const code = createDepartmentDto.code.trim().toUpperCase();

    const existingDepartment =
      await this.prismaService.hospitalDepartment.findUnique({
        where: {
          code,
        },
      });

    if (existingDepartment) {
      throw new ConflictException('Oddział z tym kodem już istnieje.');
    }

    const department = await this.prismaService.hospitalDepartment.create({
      data: {
        name: createDepartmentDto.name.trim(),
        code,
        floor: createDepartmentDto.floor,
        headDoctorName: createDepartmentDto.headDoctorName.trim(),
      },
    });

    await this.auditService.createAuditEvent({
      actorName: actor.email,
      actorRole: actor.role,
      action: 'CREATE',
      resourceType: 'HOSPITAL_STRUCTURE',
      resourceName: department.name,
      ipAddress,
      result: 'SUCCESS',
      reason: 'Utworzenie oddziału z poziomu panelu.',
    });

    return this.getDepartments();
  }

  async updateDepartment(
    departmentId: number,
    updateDepartmentDto: UpdateDepartmentDto,
    actor: JwtPayload,
    ipAddress: string,
  ) {
    const department = await this.prismaService.hospitalDepartment.findUnique({
      where: {
        id: departmentId,
      },
    });

    if (!department) {
      throw new NotFoundException('Nie odnaleziono oddziału.');
    }

    const nextCode = updateDepartmentDto.code?.trim().toUpperCase();

    if (nextCode && nextCode !== department.code) {
      const existingDepartment =
        await this.prismaService.hospitalDepartment.findUnique({
          where: {
            code: nextCode,
          },
        });

      if (existingDepartment) {
        throw new ConflictException('Oddział z tym kodem już istnieje.');
      }
    }

    const data: Prisma.HospitalDepartmentUpdateInput = {};

    if (updateDepartmentDto.name !== undefined) {
      data.name = updateDepartmentDto.name.trim();
    }

    if (nextCode !== undefined) {
      data.code = nextCode;
    }

    if (updateDepartmentDto.floor !== undefined) {
      data.floor = updateDepartmentDto.floor;
    }

    if (updateDepartmentDto.headDoctorName !== undefined) {
      data.headDoctorName = updateDepartmentDto.headDoctorName.trim();
    }

    const updatedDepartment =
      await this.prismaService.hospitalDepartment.update({
        where: {
          id: departmentId,
        },
        data,
      });

    await this.auditService.createAuditEvent({
      actorName: actor.email,
      actorRole: actor.role,
      action: 'UPDATE',
      resourceType: 'HOSPITAL_STRUCTURE',
      resourceName: updatedDepartment.name,
      ipAddress,
      result: 'SUCCESS',
      reason: 'Aktualizacja oddziału z poziomu panelu.',
    });

    return this.getDepartments();
  }

  async deleteDepartment(
    departmentId: number,
    actor: JwtPayload,
    ipAddress: string,
  ) {
    const department = await this.prismaService.hospitalDepartment.findUnique({
      where: {
        id: departmentId,
      },
      include: {
        rooms: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Nie odnaleziono oddziału.');
    }

    const roomIds = department.rooms.map((room) => room.id);

    await this.prismaService.$transaction(async (tx) => {
      if (roomIds.length > 0) {
        await tx.hospitalBed.deleteMany({
          where: {
            roomId: {
              in: roomIds,
            },
          },
        });

        await tx.hospitalRoom.deleteMany({
          where: {
            departmentId,
          },
        });
      }

      await tx.hospitalDepartment.delete({
        where: {
          id: departmentId,
        },
      });
    });

    await this.auditService.createAuditEvent({
      actorName: actor.email,
      actorRole: actor.role,
      action: 'DELETE',
      resourceType: 'HOSPITAL_STRUCTURE',
      resourceName: department.name,
      ipAddress,
      result: 'SUCCESS',
      reason: 'Usunięcie oddziału razem z salami i łóżkami.',
    });

    return this.getDepartments();
  }

  async createRoom(
    departmentId: number,
    createRoomDto: CreateRoomDto,
    actor: JwtPayload,
    ipAddress: string,
  ) {
    const department = await this.prismaService.hospitalDepartment.findUnique({
      where: {
        id: departmentId,
      },
    });

    if (!department) {
      throw new NotFoundException('Nie odnaleziono oddziału.');
    }

    const number = createRoomDto.number.trim();

    const existingRoom = await this.prismaService.hospitalRoom.findFirst({
      where: {
        departmentId,
        number,
      },
    });

    if (existingRoom) {
      throw new ConflictException(
        'Sala o tym numerze już istnieje na oddziale.',
      );
    }

    const room = await this.prismaService.hospitalRoom.create({
      data: {
        departmentId,
        number,
        type: createRoomDto.type.trim(),
      },
    });

    await this.auditService.createAuditEvent({
      actorName: actor.email,
      actorRole: actor.role,
      action: 'CREATE',
      resourceType: 'HOSPITAL_STRUCTURE',
      resourceName: `${department.name} / sala ${room.number}`,
      ipAddress,
      result: 'SUCCESS',
      reason: 'Utworzenie sali z poziomu panelu.',
    });

    return this.getDepartments();
  }

  async updateRoom(
    roomId: number,
    updateRoomDto: UpdateRoomDto,
    actor: JwtPayload,
    ipAddress: string,
  ) {
    const room = await this.prismaService.hospitalRoom.findUnique({
      where: {
        id: roomId,
      },
      include: {
        department: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Nie odnaleziono sali.');
    }

    const nextNumber = updateRoomDto.number?.trim();

    if (nextNumber && nextNumber !== room.number) {
      const existingRoom = await this.prismaService.hospitalRoom.findFirst({
        where: {
          departmentId: room.departmentId,
          number: nextNumber,
          id: {
            not: roomId,
          },
        },
      });

      if (existingRoom) {
        throw new ConflictException(
          'Sala o tym numerze już istnieje na oddziale.',
        );
      }
    }

    const data: Prisma.HospitalRoomUpdateInput = {};

    if (nextNumber !== undefined) {
      data.number = nextNumber;
    }

    if (updateRoomDto.type !== undefined) {
      data.type = updateRoomDto.type.trim();
    }

    const updatedRoom = await this.prismaService.hospitalRoom.update({
      where: {
        id: roomId,
      },
      data,
    });

    await this.auditService.createAuditEvent({
      actorName: actor.email,
      actorRole: actor.role,
      action: 'UPDATE',
      resourceType: 'HOSPITAL_STRUCTURE',
      resourceName: `${room.department.name} / sala ${updatedRoom.number}`,
      ipAddress,
      result: 'SUCCESS',
      reason: 'Aktualizacja sali z poziomu panelu.',
    });

    return this.getDepartments();
  }

  async deleteRoom(roomId: number, actor: JwtPayload, ipAddress: string) {
    const room = await this.prismaService.hospitalRoom.findUnique({
      where: {
        id: roomId,
      },
      include: {
        department: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Nie odnaleziono sali.');
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.hospitalBed.deleteMany({
        where: {
          roomId,
        },
      });

      await tx.hospitalRoom.delete({
        where: {
          id: roomId,
        },
      });
    });

    await this.auditService.createAuditEvent({
      actorName: actor.email,
      actorRole: actor.role,
      action: 'DELETE',
      resourceType: 'HOSPITAL_STRUCTURE',
      resourceName: `${room.department.name} / sala ${room.number}`,
      ipAddress,
      result: 'SUCCESS',
      reason: 'Usunięcie sali razem z łóżkami.',
    });

    return this.getDepartments();
  }

  async createBed(
    roomId: number,
    createBedDto: CreateBedDto,
    actor: JwtPayload,
    ipAddress: string,
  ) {
    const room = await this.prismaService.hospitalRoom.findUnique({
      where: {
        id: roomId,
      },
      include: {
        department: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Nie odnaleziono sali.');
    }

    const number = createBedDto.number.trim();

    const existingBed = await this.prismaService.hospitalBed.findFirst({
      where: {
        roomId,
        number,
      },
    });

    if (existingBed) {
      throw new ConflictException('Łóżko o tym numerze już istnieje w sali.');
    }

    const bed = await this.prismaService.hospitalBed.create({
      data: {
        roomId,
        number,
        status: createBedDto.status ?? 'FREE',
        patientName: createBedDto.patientName?.trim() || null,
      },
    });

    await this.auditService.createAuditEvent({
      actorName: actor.email,
      actorRole: actor.role,
      action: 'CREATE',
      resourceType: 'HOSPITAL_STRUCTURE',
      resourceName: `${room.department.name} / sala ${room.number} / łóżko ${bed.number}`,
      ipAddress,
      result: 'SUCCESS',
      reason: 'Utworzenie łóżka z poziomu panelu.',
    });

    return this.getDepartments();
  }

  async updateBed(
    bedId: number,
    updateBedDto: UpdateBedDto,
    actor: JwtPayload,
    ipAddress: string,
  ) {
    const bed = await this.prismaService.hospitalBed.findUnique({
      where: {
        id: bedId,
      },
      include: {
        room: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!bed) {
      throw new NotFoundException('Nie odnaleziono łóżka.');
    }

    const nextNumber = updateBedDto.number?.trim();

    if (nextNumber && nextNumber !== bed.number) {
      const existingBed = await this.prismaService.hospitalBed.findFirst({
        where: {
          roomId: bed.roomId,
          number: nextNumber,
          id: {
            not: bedId,
          },
        },
      });

      if (existingBed) {
        throw new ConflictException('Łóżko o tym numerze już istnieje w sali.');
      }
    }

    const data: Prisma.HospitalBedUpdateInput = {};

    if (nextNumber !== undefined) {
      data.number = nextNumber;
    }

    if (updateBedDto.status !== undefined) {
      data.status = updateBedDto.status;
    }

    if (updateBedDto.patientName !== undefined) {
      data.patientName = updateBedDto.patientName?.trim() || null;
    }

    const updatedBed = await this.prismaService.hospitalBed.update({
      where: {
        id: bedId,
      },
      data,
    });

    await this.auditService.createAuditEvent({
      actorName: actor.email,
      actorRole: actor.role,
      action: 'UPDATE',
      resourceType: 'HOSPITAL_STRUCTURE',
      resourceName: `${bed.room.department.name} / sala ${bed.room.number} / łóżko ${updatedBed.number}`,
      ipAddress,
      result: 'SUCCESS',
      reason: 'Aktualizacja łóżka z poziomu panelu.',
    });

    return this.getDepartments();
  }

  async deleteBed(bedId: number, actor: JwtPayload, ipAddress: string) {
    const bed = await this.prismaService.hospitalBed.findUnique({
      where: {
        id: bedId,
      },
      include: {
        room: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!bed) {
      throw new NotFoundException('Nie odnaleziono łóżka.');
    }

    await this.prismaService.hospitalBed.delete({
      where: {
        id: bedId,
      },
    });

    await this.auditService.createAuditEvent({
      actorName: actor.email,
      actorRole: actor.role,
      action: 'DELETE',
      resourceType: 'HOSPITAL_STRUCTURE',
      resourceName: `${bed.room.department.name} / sala ${bed.room.number} / łóżko ${bed.number}`,
      ipAddress,
      result: 'SUCCESS',
      reason: 'Usunięcie łóżka z poziomu panelu.',
    });

    return this.getDepartments();
  }
}
