import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreatePatientPayload,
  Patient,
  UpdatePatientPayload,
} from '../../shared/models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  private readonly apiUrl = '/api/v1/patients';

  constructor(private readonly httpClient: HttpClient) {}

  getPatients(): Observable<Patient[]> {
    return this.httpClient.get<Patient[]>(this.apiUrl);
  }

  createPatient(payload: CreatePatientPayload): Observable<Patient> {
    return this.httpClient.post<Patient>(this.apiUrl, payload);
  }

  getPatientById(patientId: number): Observable<Patient> {
    return this.httpClient.get<Patient>(`${this.apiUrl}/${patientId}`);
  }

  updatePatient(patientId: number, payload: UpdatePatientPayload): Observable<Patient> {
    return this.httpClient.patch<Patient>(`${this.apiUrl}/${patientId}`, payload);
  }

  authorizePatient(patientId: number): Observable<Patient> {
    return this.httpClient.patch<Patient>(`${this.apiUrl}/${patientId}/authorize`, {});
  }
}
