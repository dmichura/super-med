import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { EmployeeFunction, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuditService } from '../audit/audit.service';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

export type EmployeeSystemRole = 'ADMIN' | 'DIRECTOR' | 'EMPLOYEE';

type EmployeeWithUser = Prisma.EmployeeGetPayload<{
  include: {
    user: {
      select: {
        role: true;
      };
    };
  };
}>;

export interface EmployeeResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  systemRole: EmployeeSystemRole;
  employeeFunction: EmployeeFunction;
  departmentName: string | null;
  isActive: boolean;
}

export interface DoctorOptionRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentName: string | null;
}

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getActiveDoctorOptions(): Promise<DoctorOptionRow[]> {
    const doctors = await this.prismaService.$queryRaw<DoctorOptionRow[]>`
      SELECT
        id,
        first_name AS "firstName",
        last_name AS "lastName",
        email,
        department_name AS "departmentName"
      FROM employees
      WHERE employee_function = 'DOCTOR'
        AND is_active = true
      ORDER BY last_name ASC, first_name ASC
    `;

    return doctors;
  }

  async getEmployees(): Promise<EmployeeResponse[]> {
    const employees = await this.prismaService.employee.findMany({
      orderBy: {
        id: 'asc',
      },
      include: {
        user: {
          select: {
            role: true,
          },
        },
      },
    });

    return employees.map((employee) => this.mapEmployee(employee));
  }

  async createEmployee(
    createEmployeeDto: CreateEmployeeDto,
    actor: JwtPayload,
    ipAddress: string,
  ): Promise<EmployeeResponse> {
    const email = createEmployeeDto.email.trim().toLowerCase();

    const existingEmployee = await this.prismaService.employee.findUnique({
      where: {
        email,
      },
    });

    if (existingEmployee) {
      throw new ConflictException(
        'Pracownik z tym adresem email już istnieje.',
      );
    }

    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'Ten adres email jest już używany przez konto użytkownika.',
      );
    }

    const isActive = createEmployeeDto.isActive ?? true;
    const passwordHash = await bcrypt.hash(createEmployeeDto.password, 12);

    const createdEmployee = await this.prismaService.$transaction(
      async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            role: createEmployeeDto.systemRole,
            status: isActive ? 'ACTIVE' : 'INACTIVE',
          },
          select: {
            id: true,
          },
        });

        return tx.employee.create({
          data: {
            userId: user.id,
            firstName: createEmployeeDto.firstName,
            lastName: createEmployeeDto.lastName,
            email,
            phoneNumber: createEmployeeDto.phoneNumber,
            employeeFunction: createEmployeeDto.employeeFunction,
            departmentName: createEmployeeDto.departmentName?.trim() || null,
            isActive,
          },
          include: {
            user: {
              select: {
                role: true,
              },
            },
          },
        });
      },
    );

    const mappedEmployee = this.mapEmployee(createdEmployee);

    await this.auditService.createAuditEvent({
      actorName: actor.email,
      actorRole: actor.role,
      action: 'CREATE',
      resourceType: 'EMPLOYEE',
      resourceName: `${mappedEmployee.firstName} ${mappedEmployee.lastName}`,
      ipAddress,
      result: 'SUCCESS',
      reason: 'Utworzenie profilu pracownika z poziomu panelu.',
    });

    return mappedEmployee;
  }

  async getEmployeeById(employeeId: number): Promise<EmployeeResponse> {
    const employee = await this.prismaService.employee.findUnique({
      where: {
        id: employeeId,
      },
      include: {
        user: {
          select: {
            role: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Nie odnaleziono pracownika.');
    }

    return this.mapEmployee(employee);
  }

  async updateEmployee(
    employeeId: number,
    updateEmployeeDto: UpdateEmployeeDto,
    actor: JwtPayload,
    ipAddress: string,
  ): Promise<EmployeeResponse> {
    const employee = await this.prismaService.employee.findUnique({
      where: {
        id: employeeId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Nie odnaleziono pracownika.');
    }

    const nextEmail = updateEmployeeDto.email?.trim().toLowerCase();

    if (nextEmail && nextEmail !== employee.email) {
      const existingEmployeeWithEmail =
        await this.prismaService.employee.findFirst({
          where: {
            email: nextEmail,
            id: {
              not: employeeId,
            },
          },
        });

      if (existingEmployeeWithEmail) {
        throw new ConflictException(
          'Pracownik z tym adresem email już istnieje.',
        );
      }

      const existingUser = await this.prismaService.user.findUnique({
        where: {
          email: nextEmail,
        },
      });

      if (existingUser && existingUser.id !== employee.userId) {
        throw new ConflictException(
          'Ten adres email jest już używany przez inne konto użytkownika.',
        );
      }
    }

    const employeeData: Prisma.EmployeeUpdateInput = {};
    const userData: Prisma.UserUpdateInput = {};

    if (updateEmployeeDto.firstName !== undefined) {
      employeeData.firstName = updateEmployeeDto.firstName;
    }

    if (updateEmployeeDto.lastName !== undefined) {
      employeeData.lastName = updateEmployeeDto.lastName;
    }

    if (nextEmail !== undefined) {
      employeeData.email = nextEmail;
      userData.email = nextEmail;
    }

    if (updateEmployeeDto.phoneNumber !== undefined) {
      employeeData.phoneNumber = updateEmployeeDto.phoneNumber;
    }

    if (updateEmployeeDto.employeeFunction !== undefined) {
      employeeData.employeeFunction = updateEmployeeDto.employeeFunction;
    }

    if (updateEmployeeDto.departmentName !== undefined) {
      employeeData.departmentName =
        updateEmployeeDto.departmentName?.trim() || null;
    }

    if (updateEmployeeDto.systemRole !== undefined) {
      userData.role = updateEmployeeDto.systemRole;
    }

    if (updateEmployeeDto.isActive !== undefined) {
      employeeData.isActive = updateEmployeeDto.isActive;
      userData.status = updateEmployeeDto.isActive ? 'ACTIVE' : 'INACTIVE';
    }

    if (
      updateEmployeeDto.password !== undefined &&
      updateEmployeeDto.password.trim().length > 0
    ) {
      userData.passwordHash = await bcrypt.hash(updateEmployeeDto.password, 12);
    }

    const updatedEmployee = await this.prismaService.$transaction(
      async (tx) => {
        if (employee.userId && Object.keys(userData).length > 0) {
          await tx.user.update({
            where: {
              id: employee.userId,
            },
            data: userData,
          });
        }

        return tx.employee.update({
          where: {
            id: employeeId,
          },
          data: employeeData,
          include: {
            user: {
              select: {
                role: true,
              },
            },
          },
        });
      },
    );

    const mappedEmployee = this.mapEmployee(updatedEmployee);

    await this.auditService.createAuditEvent({
      actorName: actor.email,
      actorRole: actor.role,
      action: 'UPDATE',
      resourceType: 'EMPLOYEE',
      resourceName: `${mappedEmployee.firstName} ${mappedEmployee.lastName}`,
      ipAddress,
      result: 'SUCCESS',
      reason: 'Aktualizacja danych pracownika z poziomu panelu.',
    });

    return mappedEmployee;
  }

  async toggleEmployeeStatus(
    employeeId: number,
    actor: JwtPayload,
    ipAddress: string,
  ): Promise<EmployeeResponse> {
    const employee = await this.prismaService.employee.findUnique({
      where: {
        id: employeeId,
      },
    });

    if (!employee) {
      throw new NotFoundException('Nie odnaleziono pracownika.');
    }

    const nextIsActive = !employee.isActive;

    const updatedEmployee = await this.prismaService.$transaction(
      async (tx) => {
        if (employee.userId) {
          await tx.user.update({
            where: {
              id: employee.userId,
            },
            data: {
              status: nextIsActive ? 'ACTIVE' : 'INACTIVE',
            },
          });
        }

        return tx.employee.update({
          where: {
            id: employeeId,
          },
          data: {
            isActive: nextIsActive,
          },
          include: {
            user: {
              select: {
                role: true,
              },
            },
          },
        });
      },
    );

    const mappedEmployee = this.mapEmployee(updatedEmployee);

    await this.auditService.createAuditEvent({
      actorName: actor.email,
      actorRole: actor.role,
      action: 'UPDATE',
      resourceType: 'EMPLOYEE',
      resourceName: `${mappedEmployee.firstName} ${mappedEmployee.lastName}`,
      ipAddress,
      result: 'SUCCESS',
      reason: mappedEmployee.isActive
        ? 'Aktywacja konta pracownika.'
        : 'Dezaktywacja konta pracownika.',
    });

    return mappedEmployee;
  }

  private mapEmployee(employee: EmployeeWithUser): EmployeeResponse {
    const userRole = employee.user?.role;

    const systemRole: EmployeeSystemRole =
      userRole === 'ADMIN' || userRole === 'DIRECTOR' ? userRole : 'EMPLOYEE';

    return {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      systemRole,
      employeeFunction: employee.employeeFunction,
      departmentName: employee.departmentName,
      isActive: employee.isActive,
    };
  }
}
