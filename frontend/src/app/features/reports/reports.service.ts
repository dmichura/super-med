import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportDashboardData } from '../../shared/models/report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private readonly apiUrl = '/api/v1/reports/dashboard';

  constructor(private readonly httpClient: HttpClient) {}

  getDashboardReport(): Observable<ReportDashboardData> {
    return this.httpClient.get<ReportDashboardData>(this.apiUrl);
  }
}
