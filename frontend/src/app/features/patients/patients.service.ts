import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreatePatientPayload,
  Patient,
  UpdatePatientPayload,
  DoctorOption,
} from '../../shared/models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  private readonly apiUrl = '/api/v1/patients';
  private readonly doctorOptionsApiUrl = '/api/v1/employees/doctors/options';

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

  getDoctorOptions(): Observable<DoctorOption[]> {
    return this.httpClient.get<DoctorOption[]>(this.doctorOptionsApiUrl);
  }
}
