import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Employee,
  EmployeeFunction,
  EmployeeSystemRole,
} from '../../../../shared/models/employee.model';
import { EmployeesService } from '../../employees.service';

@Component({
  selector: 'app-employee-details',
  imports: [RouterLink],
  templateUrl: './employee-details.html',
  styleUrl: './employee-details.css',
})
export class EmployeeDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly employeesService = inject(EmployeesService);

  employee: Employee | null = null;
  isLoading = true;
  isChangingStatus = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadEmployee();
  }

  loadEmployee(): void {
    const employeeId = Number(this.route.snapshot.paramMap.get('id'));

    if (!employeeId) {
      this.errorMessage = 'Nieprawidłowy identyfikator pracownika.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.employeesService.getEmployeeById(employeeId).subscribe({
      next: (employee) => {
        this.employee = employee;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Nie odnaleziono pracownika.';
        this.isLoading = false;
      },
    });
  }

  toggleStatus(): void {
    if (!this.employee) {
      return;
    }

    this.isChangingStatus = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.employeesService.toggleEmployeeStatus(this.employee.id).subscribe({
      next: (employee) => {
        this.employee = employee;
        this.successMessage = employee.isActive
          ? 'Pracownik został aktywowany.'
          : 'Pracownik został dezaktywowany.';
        this.isChangingStatus = false;
      },
      error: () => {
        this.errorMessage = 'Nie udało się zmienić statusu pracownika.';
        this.isChangingStatus = false;
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