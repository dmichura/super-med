import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateMedicalRecordPayload,
  MedicalRecord,
  MedicalRecordDepartmentOption,
  MedicalRecordDoctorOption,
  MedicalRecordPatientOption,
  UpdateMedicalRecordPayload,
} from '../../shared/models/medical-record.model';

@Injectable({
  providedIn: 'root',
})
export class MedicalRecordsService {
  private readonly apiUrl = '/api/v1/medical-records';
  private readonly patientsApiUrl = '/api/v1/patients';
  private readonly doctorOptionsApiUrl = '/api/v1/employees/doctors/options';
  private readonly departmentsApiUrl = '/api/v1/hospital-structure/departments';

  constructor(private readonly httpClient: HttpClient) {}

  getMedicalRecords(): Observable<MedicalRecord[]> {
    return this.httpClient.get<MedicalRecord[]>(this.apiUrl);
  }

  createMedicalRecord(payload: CreateMedicalRecordPayload): Observable<MedicalRecord> {
    return this.httpClient.post<MedicalRecord>(this.apiUrl, payload);
  }

  getMedicalRecordById(recordId: number): Observable<MedicalRecord> {
    return this.httpClient.get<MedicalRecord>(`${this.apiUrl}/${recordId}`);
  }

  updateMedicalRecord(
    recordId: number,
    payload: UpdateMedicalRecordPayload,
  ): Observable<MedicalRecord> {
    return this.httpClient.patch<MedicalRecord>(`${this.apiUrl}/${recordId}`, payload);
  }

  deleteMedicalRecord(recordId: number): Observable<MedicalRecord[]> {
    return this.httpClient.delete<MedicalRecord[]>(`${this.apiUrl}/${recordId}`);
  }

  getPatientOptions(): Observable<MedicalRecordPatientOption[]> {
    return this.httpClient.get<MedicalRecordPatientOption[]>(this.patientsApiUrl);
  }

  getDoctorOptions(): Observable<MedicalRecordDoctorOption[]> {
    return this.httpClient.get<MedicalRecordDoctorOption[]>(this.doctorOptionsApiUrl);
  }

  getDepartmentOptions(): Observable<MedicalRecordDepartmentOption[]> {
    return this.httpClient.get<MedicalRecordDepartmentOption[]>(this.departmentsApiUrl);
  }
}
