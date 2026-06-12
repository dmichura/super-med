export type MedicalRecordType =
  | 'VISIT'
  | 'DIAGNOSIS'
  | 'PRESCRIPTION'
  | 'LAB_RESULT'
  | 'DISCHARGE_SUMMARY';

export type MedicalRecordStatus = 'DRAFT' | 'FINAL' | 'ARCHIVED';

export type MedicalRecordAuditAction = 'VIEW' | 'CREATE' | 'UPDATE' | 'EXPORT';

export interface MedicalRecordAuditEntry {
  id: number;
  actorName: string;
  action: MedicalRecordAuditAction;
  accessedAt: string;
  reason: string;
}

export interface MedicalRecord {
  id: number;
  patientName: string;
  patientPesel: string;
  doctorName: string;
  departmentName: string;
  type: MedicalRecordType;
  title: string;
  createdAt: string;
  status: MedicalRecordStatus;
  isSensitive: boolean;
  description: string;
  auditTrail: MedicalRecordAuditEntry[];
}