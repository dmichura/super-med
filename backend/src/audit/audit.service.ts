import { Injectable } from '@nestjs/common';
import type {
  AuditAction,
  AuditResourceType,
  AuditResult,
} from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

interface CreateAuditEventPayload {
  actorName: string;
  actorRole: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceName: string;
  ipAddress: string;
  result: AuditResult;
  reason: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prismaService: PrismaService) {}

  async createAuditEvent(payload: CreateAuditEventPayload): Promise<void> {
    await this.prismaService.auditEvent.create({
      data: {
        code: `AUD-${randomUUID()}`,
        actorName: payload.actorName,
        actorRole: payload.actorRole,
        action: payload.action,
        resourceType: payload.resourceType,
        resourceName: payload.resourceName,
        occurredAt: new Date(),
        ipAddress: payload.ipAddress,
        result: payload.result,
        reason: payload.reason,
      },
    });
  }

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
