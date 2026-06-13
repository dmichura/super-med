import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient } from '../../shared/models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  private readonly apiUrl = '/api/v1/patients';

  constructor(private readonly httpClient: HttpClient) {}

  getPatients(): Observable<Patient[]> {
    return this.httpClient.get<Patient[]>(this.apiUrl);
  }

  getPatientById(patientId: number): Observable<Patient> {
    return this.httpClient.get<Patient>(`${this.apiUrl}/${patientId}`);
  }

  authorizePatient(patientId: number): Observable<Patient> {
    return this.httpClient.patch<Patient>(`${this.apiUrl}/${patientId}/authorize`, {});
  }
}
