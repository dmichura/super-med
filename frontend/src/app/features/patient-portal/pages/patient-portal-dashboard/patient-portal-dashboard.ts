import { Component, OnInit, inject } from '@angular/core';
import { PatientPortalDashboardData } from '../../../../shared/models/patient-portal.model';
import { PatientPortalService } from '../../patient-portal.service';

@Component({
  selector: 'app-patient-portal-dashboard',
  imports: [],
  templateUrl: './patient-portal-dashboard.html',
  styleUrl: './patient-portal-dashboard.css',
})
export class PatientPortalDashboard implements OnInit {
  private readonly patientPortalService = inject(PatientPortalService);

  dashboardData: PatientPortalDashboardData | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.patientPortalService.getDashboardData().subscribe({
      next: (dashboardData) => {
        this.dashboardData = dashboardData;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać danych Portalu Pacjenta.';
        this.isLoading = false;
      },
    });
  }
}