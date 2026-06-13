import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HospitalStructureService {
  constructor(private readonly prismaService: PrismaService) {}

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
}
