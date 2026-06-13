import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from 'src/audit/audit.service';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

type EmployeeWithUser = Prisma.EmployeeGetPayload<{
  include: {
    user: {
      select: {
        role: true;
      };
    };
  };
}>;

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

  async getActiveDoctorOptions() {
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

  async getEmployees() {
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

  async getEmployeeById(employeeId: number) {
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

  async toggleEmployeeStatus(
    employeeId: number,
    actor: JwtPayload,
    ipAddress: string,
  ) {
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
        const updated = await tx.employee.update({
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

        return updated;
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

  private mapEmployee(employee: EmployeeWithUser) {
    const userRole = employee.user?.role;

    const systemRole =
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
