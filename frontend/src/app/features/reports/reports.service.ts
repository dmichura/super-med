import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ReportDashboardData } from '../../shared/models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  getDashboardReport(): Observable<ReportDashboardData> {
    // Docelowo: GET /api/v1/reports/dashboard
    return of({
      summary: {
        totalPatients: 3,
        pendingPatientAuthorizations: 1,
        activeEmployees: 4,
        freeBeds: 2,
        occupiedBeds: 2,
        medicalRecords: 4,
        sensitiveMedicalRecords: 4,
        auditEvents: 6,
      },
      departmentOccupancy: [
        {
          departmentName: 'Oddział Kardiologii',
          totalBeds: 3,
          freeBeds: 1,
          occupiedBeds: 1,
          blockedBeds: 0,
          cleaningBeds: 1,
        },
        {
          departmentName: 'Oddział Neurologii',
          totalBeds: 3,
          freeBeds: 1,
          occupiedBeds: 1,
          blockedBeds: 1,
          cleaningBeds: 0,
        },
      ],
    });
  }
}