import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Employee } from '../../shared/models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private readonly apiUrl = '/api/v1/employees';

  constructor(private readonly httpClient: HttpClient) {}

  getEmployees(): Observable<Employee[]> {
    return this.httpClient.get<Employee[]>(this.apiUrl);
  }

  getEmployeeById(employeeId: number): Observable<Employee> {
    return this.httpClient.get<Employee>(`${this.apiUrl}/${employeeId}`);
  }

  toggleEmployeeStatus(employeeId: number): Observable<Employee> {
    return this.httpClient.patch<Employee>(`${this.apiUrl}/${employeeId}/status`, {});
  }
}
