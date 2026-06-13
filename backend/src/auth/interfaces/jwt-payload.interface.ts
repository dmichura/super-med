export interface JwtPayload {
  sub: string;
  email: string;
  role: 'ADMIN' | 'DIRECTOR' | 'EMPLOYEE' | 'PATIENT';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION' | 'BLOCKED';
}