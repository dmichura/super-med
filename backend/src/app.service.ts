import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHealth() {
    await this.prismaService.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      service: 'supermed-backend',
      database: 'ok',
      name: 'SuperMED — System Zarządzania Szpitalem i EDM',
      timestamp: new Date().toISOString(),
    };
  }
}