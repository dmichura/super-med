import { Component, OnInit, inject } from '@angular/core';
import { Patient } from '../../../../shared/models/patient.model';
import { PatientsService } from '../../patients.service';

@Component({
  selector: 'app-patients-list',
  imports: [],
  templateUrl: './patients-list.html',
  styleUrl: './patients-list.css',
})
export class PatientsList implements OnInit {
  private readonly patientsService = inject(PatientsService);

  patients: Patient[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.patientsService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać listy pacjentów.';
        this.isLoading = false;
      },
    });
  }
}