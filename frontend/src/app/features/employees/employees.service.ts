import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateEmployeePayload,
  DepartmentOption,
  Employee,
  UpdateEmployeePayload,
} from '../../shared/models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private readonly apiUrl = '/api/v1/employees';
  private readonly departmentsApiUrl = '/api/v1/hospital-structure/departments';

  constructor(private readonly httpClient: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.httpClient.get<Employee[]>(this.apiUrl);
  }

  getDepartmentOptions(): Observable<DepartmentOption[]> {
    return this.httpClient.get<DepartmentOption[]>(this.departmentsApiUrl);
  }

  createEmployee(payload: CreateEmployeePayload): Observable<Employee> {
    return this.httpClient.post<Employee>(this.apiUrl, payload);
  }

  getEmployeeById(employeeId: number): Observable<Employee> {
    return this.httpClient.get<Employee>(`${this.apiUrl}/${employeeId}`);
  }

  updateEmployee(employeeId: number, payload: UpdateEmployeePayload): Observable<Employee> {
    return this.httpClient.patch<Employee>(`${this.apiUrl}/${employeeId}`, payload);
  }

  toggleEmployeeStatus(employeeId: number): Observable<Employee> {
    return this.httpClient.patch<Employee>(`${this.apiUrl}/${employeeId}/status`, {});
  }
}
