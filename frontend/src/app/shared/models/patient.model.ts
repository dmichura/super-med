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