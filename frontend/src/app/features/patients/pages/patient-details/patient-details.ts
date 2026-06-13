import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Patient } from '../../../../shared/models/patient.model';
import { PatientsService } from '../../patients.service';

@Component({
  selector: 'app-patient-details',
  imports: [RouterLink],
  templateUrl: './patient-details.html',
  styleUrl: './patient-details.css',
})
export class PatientDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly patientsService = inject(PatientsService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  patient: Patient | null = null;
  isLoading = true;
  isAuthorizing = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadPatient();
  }

  loadPatient(): void {
    const patientId = Number(this.route.snapshot.paramMap.get('id'));

    if (!patientId) {
      this.errorMessage = 'Nieprawidłowy identyfikator pacjenta.';
      this.isLoading = false;
      this.changeDetectorRef.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.patientsService.getPatientById(patientId).subscribe({
      next: (patient) => {
        this.patient = patient;
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Nie odnaleziono pacjenta.';
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  authorizePatient(): void {
    if (!this.patient) {
      return;
    }

    this.isAuthorizing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.patientsService.authorizePatient(this.patient.id).subscribe({
      next: (patient) => {
        this.patient = patient;
        this.successMessage = 'Konto pacjenta zostało autoryzowane.';
        this.isAuthorizing = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Nie udało się autoryzować konta pacjenta.';
        this.isAuthorizing = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }
}
