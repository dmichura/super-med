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

export interface CreateMedicalRecordPayload {
  patientId: number;
  doctorName: string;
  departmentName: string;
  type: MedicalRecordType;
  title: string;
  status: MedicalRecordStatus;
  isSensitive: boolean;
  description: string;
}

export interface UpdateMedicalRecordPayload {
  patientId?: number;
  doctorName?: string;
  departmentName?: string;
  type?: MedicalRecordType;
  title?: string;
  status?: MedicalRecordStatus;
  isSensitive?: boolean;
  description?: string;
}

export interface MedicalRecordPatientOption {
  id: number;
  firstName: string;
  lastName: string;
  pesel: string;
  email: string;
  isAuthorized: boolean;
  assignedDoctorName: string | null;
  isActive: boolean;
}

export interface MedicalRecordDoctorOption {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentName: string | null;
}

export interface MedicalRecordDepartmentOption {
  id: number;
  name: string;
  code: string;
  floor: number;
  headDoctorName: string;
}
