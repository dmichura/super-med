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