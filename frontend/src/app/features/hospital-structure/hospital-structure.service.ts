import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateBedPayload,
  CreateDepartmentPayload,
  CreateRoomPayload,
  HospitalDepartment,
  PatientOption,
  UpdateBedPayload,
  UpdateDepartmentPayload,
  UpdateRoomPayload,
} from '../../shared/models/hospital-structure.model';
import { DoctorOption } from '../../shared/models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class HospitalStructureService {
  private readonly apiUrl = '/api/v1/hospital-structure';

  constructor(private readonly httpClient: HttpClient) {}

  getDoctorOptions(): Observable<DoctorOption[]> {
    return this.httpClient.get<DoctorOption[]>('/api/v1/employees/doctors/options');
  }

  getDepartments(): Observable<HospitalDepartment[]> {
    return this.httpClient.get<HospitalDepartment[]>(`${this.apiUrl}/departments`);
  }

  createDepartment(payload: CreateDepartmentPayload): Observable<HospitalDepartment[]> {
    return this.httpClient.post<HospitalDepartment[]>(`${this.apiUrl}/departments`, payload);
  }

  updateDepartment(
    departmentId: number,
    payload: UpdateDepartmentPayload,
  ): Observable<HospitalDepartment[]> {
    return this.httpClient.patch<HospitalDepartment[]>(
      `${this.apiUrl}/departments/${departmentId}`,
      payload,
    );
  }

  deleteDepartment(departmentId: number): Observable<HospitalDepartment[]> {
    return this.httpClient.delete<HospitalDepartment[]>(
      `${this.apiUrl}/departments/${departmentId}`,
    );
  }

  createRoom(departmentId: number, payload: CreateRoomPayload): Observable<HospitalDepartment[]> {
    return this.httpClient.post<HospitalDepartment[]>(
      `${this.apiUrl}/departments/${departmentId}/rooms`,
      payload,
    );
  }

  updateRoom(roomId: number, payload: UpdateRoomPayload): Observable<HospitalDepartment[]> {
    return this.httpClient.patch<HospitalDepartment[]>(`${this.apiUrl}/rooms/${roomId}`, payload);
  }

  deleteRoom(roomId: number): Observable<HospitalDepartment[]> {
    return this.httpClient.delete<HospitalDepartment[]>(`${this.apiUrl}/rooms/${roomId}`);
  }

  createBed(roomId: number, payload: CreateBedPayload): Observable<HospitalDepartment[]> {
    return this.httpClient.post<HospitalDepartment[]>(
      `${this.apiUrl}/rooms/${roomId}/beds`,
      payload,
    );
  }

  updateBed(bedId: number, payload: UpdateBedPayload): Observable<HospitalDepartment[]> {
    return this.httpClient.patch<HospitalDepartment[]>(`${this.apiUrl}/beds/${bedId}`, payload);
  }

  deleteBed(bedId: number): Observable<HospitalDepartment[]> {
    return this.httpClient.delete<HospitalDepartment[]>(`${this.apiUrl}/beds/${bedId}`);
  }

  getPatientOptions(): Observable<PatientOption[]> {
    return this.httpClient.get<PatientOption[]>(`${this.apiUrl}/patients/options`);
  }
}
