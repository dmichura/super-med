export interface ReportSummary {
  totalPatients: number;
  pendingPatientAuthorizations: number;
  activeEmployees: number;
  freeBeds: number;
  occupiedBeds: number;
  medicalRecords: number;
  sensitiveMedicalRecords: number;
  auditEvents: number;
}

export interface DepartmentOccupancyReport {
  departmentName: string;
  totalBeds: number;
  freeBeds: number;
  occupiedBeds: number;
  blockedBeds: number;
  cleaningBeds: number;
}

export interface ReportDashboardData {
  summary: ReportSummary;
  departmentOccupancy: DepartmentOccupancyReport[];
}