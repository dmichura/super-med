import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAuditEvents() {
    const auditEvents = await this.prismaService.auditEvent.findMany({
      orderBy: {
        occurredAt: 'desc',
      },
    });

    return auditEvents.map((event) => ({
      id: event.id,
      actorName: event.actorName,
      actorRole: event.actorRole,
      action: event.action,
      resourceType: event.resourceType,
      resourceName: event.resourceName,
      occurredAt: this.formatDateTime(event.occurredAt),
      ipAddress: event.ipAddress,
      result: event.result,
      reason: event.reason,
    }));
  }

  private formatDateTime(value: Date): string {
    return value.toISOString().slice(0, 16).replace('T', ' ');
  }
}
