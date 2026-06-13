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

export interface CreateDocumentPayload {
  patientId: number;
  type: DocumentType;
  fileName: string;
  status: DocumentStatus;
  isSensitive: boolean;
}

export interface UpdateDocumentPayload {
  patientId?: number;
  type?: DocumentType;
  fileName?: string;
  status?: DocumentStatus;
  isSensitive?: boolean;
}

export interface DocumentPatientOption {
  id: number;
  firstName: string;
  lastName: string;
  pesel: string;
  email: string;
  isAuthorized: boolean;
  assignedDoctorName: string | null;
  isActive: boolean;
}
