export type BedStatus = 'FREE' | 'OCCUPIED' | 'BLOCKED' | 'CLEANING';

export interface HospitalBed {
  id: number;
  number: string;
  status: BedStatus;
  patientName: string | null;
}

export interface HospitalRoom {
  id: number;
  number: string;
  type: string;
  beds: HospitalBed[];
}

export interface HospitalDepartment {
  id: number;
  name: string;
  code: string;
  floor: number;
  headDoctorName: string;
  rooms: HospitalRoom[];
}

export interface CreateDepartmentPayload {
  name: string;
  code: string;
  floor: number;
  headDoctorName: string;
}

export interface UpdateDepartmentPayload {
  name?: string;
  code?: string;
  floor?: number;
  headDoctorName?: string;
}

export interface CreateRoomPayload {
  number: string;
  type: string;
}

export interface UpdateRoomPayload {
  number?: string;
  type?: string;
}

export interface CreateBedPayload {
  number: string;
  status: BedStatus;
  patientName: string | null;
}

export interface UpdateBedPayload {
  number?: string;
  status?: BedStatus;
  patientName?: string | null;
}

export interface PatientOption {
  id: number;
  firstName: string;
  lastName: string;
  pesel: string;
  email: string;
  isAuthorized: boolean;
}
