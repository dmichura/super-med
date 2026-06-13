import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MedicalRecord } from '../../shared/models/medical-record.model';

@Injectable({
  providedIn: 'root',
})
export class MedicalRecordsService {
  private readonly apiUrl = '/api/v1/medical-records';

  constructor(private readonly httpClient: HttpClient) {}

  getMedicalRecords(): Observable<MedicalRecord[]> {
    return this.httpClient.get<MedicalRecord[]>(this.apiUrl);
  }

  getMedicalRecordById(recordId: number): Observable<MedicalRecord> {
    return this.httpClient.get<MedicalRecord>(`${this.apiUrl}/${recordId}`);
  }
}
