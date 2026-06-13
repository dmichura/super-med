import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  Employee,
  EmployeeFunction,
  EmployeeSystemRole,
} from '../../../../shared/models/employee.model';
import { EmployeesService } from '../../employees.service';

type RoleFilter = 'ALL' | EmployeeSystemRole;
type FunctionFilter = 'ALL' | EmployeeFunction;
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

@Component({
  selector: 'app-employees-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './employees-list.html',
  styleUrl: './employees-list.css',
})
export class EmployeesList implements OnInit {
  private readonly employeesService = inject(EmployeesService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  employees: Employee[] = [];
  searchTerm = '';
  roleFilter: RoleFilter = 'ALL';
  functionFilter: FunctionFilter = 'ALL';
  statusFilter: StatusFilter = 'ALL';
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadEmployees();
  }

  get filteredEmployees(): Employee[] {
    const searchValue = this.searchTerm.trim().toLowerCase();

    return this.employees.filter((employee) => {
      const matchesSearch =
        !searchValue ||
        employee.firstName.toLowerCase().includes(searchValue) ||
        employee.lastName.toLowerCase().includes(searchValue) ||
        employee.email.toLowerCase().includes(searchValue) ||
        employee.phoneNumber.toLowerCase().includes(searchValue) ||
        (employee.departmentName ?? '').toLowerCase().includes(searchValue);

      const matchesRole = this.roleFilter === 'ALL' || employee.systemRole === this.roleFilter;

      const matchesFunction =
        this.functionFilter === 'ALL' || employee.employeeFunction === this.functionFilter;

      const matchesStatus =
        this.statusFilter === 'ALL' ||
        (this.statusFilter === 'ACTIVE' && employee.isActive) ||
        (this.statusFilter === 'INACTIVE' && !employee.isActive);

      return matchesSearch && matchesRole && matchesFunction && matchesStatus;
    });
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.employeesService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać listy pracowników.';
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
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
