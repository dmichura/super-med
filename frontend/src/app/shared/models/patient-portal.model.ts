export interface PatientPortalProfile {
  firstName: string;
  lastName: string;
  pesel: string;
  email: string;
  isAuthorized: boolean;
  assignedDoctorName: string | null;
}

export interface PatientPortalVisit {
  id: number;
  date: string;
  doctorName: string;
  departmentName: string;
  reason: string;
}

export interface PatientPortalMedicalRecord {
  id: number;
  title: string;
  type: string;
  createdAt: string;
  doctorName: string;
}

export interface PatientPortalDocument {
  id: number;
  fileName: string;
  type: string;
  uploadedAt: string;
  status: string;
}

export interface PatientPortalDashboardData {
  profile: PatientPortalProfile;
  upcomingVisits: PatientPortalVisit[];
  latestMedicalRecords: PatientPortalMedicalRecord[];
  documents: PatientPortalDocument[];
}