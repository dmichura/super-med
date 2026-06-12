export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'EXPORT'
  | 'AUTHORIZE';

export type AuditResourceType =
  | 'AUTH'
  | 'PATIENT'
  | 'EMPLOYEE'
  | 'MEDICAL_RECORD'
  | 'HOSPITAL_STRUCTURE'
  | 'REPORT';

export type AuditResult = 'SUCCESS' | 'DENIED' | 'ERROR';

export interface AuditEvent {
  id: number;
  actorName: string;
  actorRole: string;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceName: string;
  occurredAt: string;
  ipAddress: string;
  result: AuditResult;
  reason: string;
}