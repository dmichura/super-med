import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Patient } from '../../../../shared/models/patient.model';
import { PatientsService } from '../../patients.service';

@Component({
  selector: 'app-patients-list',
  imports: [RouterLink],
  templateUrl: './patients-list.html',
  styleUrl: './patients-list.css',
})
export class PatientsList implements OnInit {
  private readonly patientsService = inject(PatientsService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

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
