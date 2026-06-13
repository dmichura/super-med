export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  pesel: string;
  email: string;
  isAuthorized: boolean;
  assignedDoctorName: string | null;
  isActive: boolean;
}

export interface CreatePatientPayload {
  firstName: string;
  lastName: string;
  pesel: string;
  email: string;
  assignedDoctorName: string | null;
}

export interface UpdatePatientPayload {
  firstName?: string;
  lastName?: string;
  pesel?: string;
  email?: string;
  assignedDoctorName?: string | null;
  isActive?: boolean;
}

export interface DoctorOption {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  departmentName: string | null;
}
