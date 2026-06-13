import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  CreateEmployeePayload,
  DepartmentOption,
  Employee,
  EmployeeFunction,
  EmployeeSystemRole,
  UpdateEmployeePayload,
} from '../../../../shared/models/employee.model';
import { EmployeesService } from '../../employees.service';

interface EmployeeFormState {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  systemRole: EmployeeSystemRole;
  employeeFunction: EmployeeFunction;
  departmentName: string;
  password: string;
  isActive: boolean;
}

@Component({
  selector: 'app-employee-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css',
})
export class EmployeeForm implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeesService = inject(EmployeesService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  employeeId: number | null = null;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  departmentOptions: DepartmentOption[] = [];

  readonly systemRoleOptions: Array<{
    value: EmployeeSystemRole;
    label: string;
  }> = [
    {
      value: 'EMPLOYEE',
      label: 'Pracownik',
    },
    {
      value: 'DIRECTOR',
      label: 'Dyrektor',
    },
    {
      value: 'ADMIN',
      label: 'Administrator',
    },
  ];

  readonly employeeFunctionOptions: Array<{
    value: EmployeeFunction;
    label: string;
  }> = [
    {
      value: 'DOCTOR',
      label: 'Lekarz',
    },
    {
      value: 'NURSE',
      label: 'Pielęgniarka',
    },
    {
      value: 'PARAMEDIC',
      label: 'Ratownik medyczny',
    },
    {
      value: 'RECEPTIONIST',
      label: 'Recepcja',
    },
    {
      value: 'SECURITY',
      label: 'Ochrona',
    },
    {
      value: 'IT_ADMIN',
      label: 'Administrator IT',
    },
  ];

  form: EmployeeFormState = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    systemRole: 'EMPLOYEE',
    employeeFunction: 'DOCTOR',
    departmentName: '',
    password: '',
    isActive: true,
  };

  ngOnInit(): void {
    this.loadDepartmentOptions();

    const employeeId = Number(this.route.snapshot.paramMap.get('id'));

    if (employeeId) {
      this.employeeId = employeeId;
      this.isEditMode = true;
      this.loadEmployee(employeeId);
    }
  }

  loadDepartmentOptions(): void {
    this.employeesService.getDepartmentOptions().subscribe({
      next: (departmentOptions) => {
        this.departmentOptions = departmentOptions;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać listy oddziałów.';
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  loadEmployee(employeeId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.employeesService.getEmployeeById(employeeId).subscribe({
      next: (employee) => {
        this.fillForm(employee);
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać danych pracownika.';
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  saveEmployee(): void {
    this.errorMessage = '';
    this.isSaving = true;

    if (this.isEditMode && this.employeeId) {
      const payload: UpdateEmployeePayload = {
        firstName: this.form.firstName.trim(),
        lastName: this.form.lastName.trim(),
        email: this.form.email.trim(),
        phoneNumber: this.form.phoneNumber.trim(),
        systemRole: this.form.systemRole,
        employeeFunction: this.form.employeeFunction,
        departmentName: this.form.departmentName.trim() || null,
        isActive: this.form.isActive,
      };

      const password = this.form.password.trim();

      if (password) {
        payload.password = password;
      }

      this.employeesService.updateEmployee(this.employeeId, payload).subscribe({
        next: (employee) => {
          this.router.navigate(['/employees', employee.id]);
        },
        error: () => {
          this.errorMessage = 'Nie udało się zapisać zmian. Sprawdź dane pracownika.';
          this.isSaving = false;
          this.changeDetectorRef.detectChanges();
        },
      });

      return;
    }

    const payload: CreateEmployeePayload = {
      firstName: this.form.firstName.trim(),
      lastName: this.form.lastName.trim(),
      email: this.form.email.trim(),
      phoneNumber: this.form.phoneNumber.trim(),
      systemRole: this.form.systemRole,
      employeeFunction: this.form.employeeFunction,
      departmentName: this.form.departmentName.trim() || null,
      password: this.form.password.trim(),
      isActive: this.form.isActive,
    };

    this.employeesService.createEmployee(payload).subscribe({
      next: (employee) => {
        this.router.navigate(['/employees', employee.id]);
      },
      error: () => {
        this.errorMessage =
          'Nie udało się dodać pracownika. Sprawdź, czy email nie istnieje już w systemie.';
        this.isSaving = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  getDepartmentOptionLabel(department: DepartmentOption): string {
    return `${department.name} (${department.code}, piętro ${department.floor})`;
  }

  hasSelectedDepartmentInOptions(): boolean {
    if (!this.form.departmentName) {
      return true;
    }

    return this.departmentOptions.some(
      (department) => department.name === this.form.departmentName,
    );
  }

  private fillForm(employee: Employee): void {
    this.form = {
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      systemRole: employee.systemRole,
      employeeFunction: employee.employeeFunction,
      departmentName: employee.departmentName ?? '',
      password: '',
      isActive: employee.isActive,
    };
  }
}
