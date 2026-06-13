import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateEmployeePayload,
  Employee,
  UpdateEmployeePayload,
} from '../../shared/models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private readonly apiUrl = '/api/v1/employees';

  constructor(private readonly httpClient: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.httpClient.get<Employee[]>(this.apiUrl);
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
