export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
}

export type UserRole = 'ADMIN' | 'DIRECTOR' | 'EMPLOYEE' | 'PATIENT';

export type EmployeeFunction =
  | 'DOCTOR'
  | 'NURSE'
  | 'PARAMEDIC'
  | 'RECEPTIONIST'
  | 'SECURITY'
  | 'IT_ADMIN';

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  employeeFunction?: EmployeeFunction;
}