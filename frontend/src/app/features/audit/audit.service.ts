import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuditEvent } from '../../shared/models/audit-event.model';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private readonly apiUrl = '/api/v1/audit/events';

  constructor(private readonly httpClient: HttpClient) {}

  getAuditEvents(): Observable<AuditEvent[]> {
    return this.httpClient.get<AuditEvent[]>(this.apiUrl);
  }
}
