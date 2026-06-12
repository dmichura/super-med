export type EmployeeSystemRole = 'ADMIN' | 'DIRECTOR' | 'EMPLOYEE';

export type EmployeeFunction =
  | 'DOCTOR'
  | 'NURSE'
  | 'PARAMEDIC'
  | 'RECEPTIONIST'
  | 'SECURITY'
  | 'IT_ADMIN';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  systemRole: EmployeeSystemRole;
  employeeFunction: EmployeeFunction;
  departmentName: string | null;
  isActive: boolean;
}