import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Patient } from '../../../../shared/models/patient.model';
import { PatientsService } from '../../patients.service';

type AuthorizationFilter = 'ALL' | 'AUTHORIZED' | 'PENDING';
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

@Component({
  selector: 'app-patients-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './patients-list.html',
  styleUrl: './patients-list.css',
})
export class PatientsList implements OnInit {
  private readonly patientsService = inject(PatientsService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  patients: Patient[] = [];
  searchTerm = '';
  authorizationFilter: AuthorizationFilter = 'ALL';
  statusFilter: StatusFilter = 'ALL';
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadPatients();
  }

  get filteredPatients(): Patient[] {
    const searchValue = this.searchTerm.trim().toLowerCase();

    return this.patients.filter((patient) => {
      const matchesSearch =
        !searchValue ||
        patient.firstName.toLowerCase().includes(searchValue) ||
        patient.lastName.toLowerCase().includes(searchValue) ||
        patient.pesel.includes(searchValue) ||
        patient.email.toLowerCase().includes(searchValue) ||
        (patient.assignedDoctorName ?? '').toLowerCase().includes(searchValue);

      const matchesAuthorization =
        this.authorizationFilter === 'ALL' ||
        (this.authorizationFilter === 'AUTHORIZED' && patient.isAuthorized) ||
        (this.authorizationFilter === 'PENDING' && !patient.isAuthorized);

      const matchesStatus =
        this.statusFilter === 'ALL' ||
        (this.statusFilter === 'ACTIVE' && patient.isActive) ||
        (this.statusFilter === 'INACTIVE' && !patient.isActive);

      return matchesSearch && matchesAuthorization && matchesStatus;
    });
  }

  loadPatients(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.patientsService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać listy pacjentów.';
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }
}
