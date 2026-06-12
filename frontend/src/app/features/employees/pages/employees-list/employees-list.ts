import { Component, OnInit, inject } from '@angular/core';
import {
  Employee,
  EmployeeFunction,
  EmployeeSystemRole,
} from '../../../../shared/models/employee.model';
import { EmployeesService } from '../../employees.service';

@Component({
  selector: 'app-employees-list',
  imports: [],
  templateUrl: './employees-list.html',
  styleUrl: './employees-list.css',
})
export class EmployeesList implements OnInit {
  private readonly employeesService = inject(EmployeesService);

  employees: Employee[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.employeesService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać listy pracowników.';
        this.isLoading = false;
      },
    });
  }

  getSystemRoleLabel(role: EmployeeSystemRole): string {
    const labels: Record<EmployeeSystemRole, string> = {
      ADMIN: 'Administrator',
      DIRECTOR: 'Dyrektor',
      EMPLOYEE: 'Pracownik',
    };

    return labels[role];
  }

  getFunctionLabel(employeeFunction: EmployeeFunction): string {
    const labels: Record<EmployeeFunction, string> = {
      DOCTOR: 'Lekarz',
      NURSE: 'Pielęgniarka',
      PARAMEDIC: 'Ratownik medyczny',
      RECEPTIONIST: 'Recepcja',
      SECURITY: 'Ochrona',
      IT_ADMIN: 'Administrator IT',
    };

    return labels[employeeFunction];
  }
}