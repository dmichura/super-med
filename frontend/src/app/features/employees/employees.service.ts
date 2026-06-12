import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Employee } from '../../shared/models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeesService {
  private readonly employees: Employee[] = [
    {
      id: 1,
      firstName: 'Anna',
      lastName: 'Nowak',
      email: 'anna.nowak@supermed.pl',
      phoneNumber: '+48 500 100 200',
      systemRole: 'EMPLOYEE',
      employeeFunction: 'DOCTOR',
      departmentName: 'Oddział Kardiologii',
      isActive: true,
    },
    {
      id: 2,
      firstName: 'Piotr',
      lastName: 'Zieliński',
      email: 'piotr.zielinski@supermed.pl',
      phoneNumber: '+48 500 200 300',
      systemRole: 'EMPLOYEE',
      employeeFunction: 'DOCTOR',
      departmentName: 'Oddział Neurologii',
      isActive: true,
    },
    {
      id: 3,
      firstName: 'Katarzyna',
      lastName: 'Wójcik',
      email: 'katarzyna.wojcik@supermed.pl',
      phoneNumber: '+48 500 300 400',
      systemRole: 'EMPLOYEE',
      employeeFunction: 'NURSE',
      departmentName: 'Oddział Kardiologii',
      isActive: true,
    },
    {
      id: 4,
      firstName: 'Michał',
      lastName: 'Kamiński',
      email: 'michal.kaminski@supermed.pl',
      phoneNumber: '+48 500 400 500',
      systemRole: 'ADMIN',
      employeeFunction: 'IT_ADMIN',
      departmentName: null,
      isActive: true,
    },
    {
      id: 5,
      firstName: 'Ewa',
      lastName: 'Lewandowska',
      email: 'ewa.lewandowska@supermed.pl',
      phoneNumber: '+48 500 500 600',
      systemRole: 'DIRECTOR',
      employeeFunction: 'RECEPTIONIST',
      departmentName: null,
      isActive: false,
    },
  ];

  getEmployees(): Observable<Employee[]> {
    // Docelowo: GET /api/v1/employees
    return of([...this.employees]);
  }
}