import { Injectable } from '@nestjs/common';
import type { BedStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getDashboardReport() {
    const [
      totalPatients,
      pendingPatientAuthorizations,
      activeEmployees,
      beds,
      medicalRecords,
      sensitiveMedicalRecords,
      auditEvents,
      departments,
    ] = await Promise.all([
      this.prismaService.patient.count(),
      this.prismaService.patient.count({
        where: {
          isAuthorized: false,
        },
      }),
      this.prismaService.employee.count({
        where: {
          isActive: true,
        },
      }),
      this.prismaService.hospitalBed.findMany({
        select: {
          status: true,
        },
      }),
      this.prismaService.medicalRecord.count(),
      this.prismaService.medicalRecord.count({
        where: {
          isSensitive: true,
        },
      }),
      this.prismaService.auditEvent.count(),
      this.prismaService.hospitalDepartment.findMany({
        orderBy: [
          {
            floor: 'asc',
          },
          {
            name: 'asc',
          },
        ],
        select: {
          name: true,
          rooms: {
            select: {
              beds: {
                select: {
                  status: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const freeBeds = this.countBedsByStatus(beds, 'FREE');
    const occupiedBeds = this.countBedsByStatus(beds, 'OCCUPIED');

    const departmentOccupancy = departments.map((department) => {
      const departmentBeds = department.rooms.flatMap((room) => room.beds);

      return {
        departmentName: department.name,
        totalBeds: departmentBeds.length,
        freeBeds: this.countBedsByStatus(departmentBeds, 'FREE'),
        occupiedBeds: this.countBedsByStatus(departmentBeds, 'OCCUPIED'),
        blockedBeds: this.countBedsByStatus(departmentBeds, 'BLOCKED'),
        cleaningBeds: this.countBedsByStatus(departmentBeds, 'CLEANING'),
      };
    });

    return {
      summary: {
        totalPatients,
        pendingPatientAuthorizations,
        activeEmployees,
        freeBeds,
        occupiedBeds,
        medicalRecords,
        sensitiveMedicalRecords,
        auditEvents,
      },
      departmentOccupancy,
    };
  }

  private countBedsByStatus(
    beds: Array<{
      status: BedStatus;
    }>,
    status: BedStatus,
  ): number {
    return beds.filter((bed) => bed.status === status).length;
  }
}
