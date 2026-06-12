import { Component, OnInit, inject } from '@angular/core';
import { ReportDashboardData } from '../../../../shared/models/report.model';
import { ReportsService } from '../../reports.service';

@Component({
  selector: 'app-reports-dashboard',
  imports: [],
  templateUrl: './reports-dashboard.html',
  styleUrl: './reports-dashboard.css',
})
export class ReportsDashboard implements OnInit {
  private readonly reportsService = inject(ReportsService);

  reportData: ReportDashboardData | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.reportsService.getDashboardReport().subscribe({
      next: (reportData) => {
        this.reportData = reportData;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać raportów.';
        this.isLoading = false;
      },
    });
  }

  getOccupancyPercent(totalBeds: number, occupiedBeds: number): number {
    if (totalBeds === 0) {
      return 0;
    }

    return Math.round((occupiedBeds / totalBeds) * 100);
  }
}