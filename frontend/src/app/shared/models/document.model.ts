export type DocumentType =
  | 'MEDICAL_SCAN'
  | 'LAB_ATTACHMENT'
  | 'CONSENT'
  | 'ADMINISTRATIVE'
  | 'DISCHARGE_FILE';

export type DocumentStatus = 'UPLOADED' | 'VERIFIED' | 'REJECTED' | 'ARCHIVED';

export interface PatientDocument {
  id: number;
  patientName: string;
  patientPesel: string;
  type: DocumentType;
  fileName: string;
  status: DocumentStatus;
  uploadedBy: string;
  uploadedAt: string;
  isSensitive: boolean;
}