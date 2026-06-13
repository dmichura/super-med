import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  CreatePatientPayload,
  DoctorOption,
  Patient,
  UpdatePatientPayload,
} from '../../../../shared/models/patient.model';
import { PatientsService } from '../../patients.service';

@Component({
  selector: 'app-patient-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './patient-form.html',
  styleUrl: './patient-form.css',
})
export class PatientForm implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly patientsService = inject(PatientsService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  patientId: number | null = null;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  form = {
    firstName: '',
    lastName: '',
    pesel: '',
    email: '',
    assignedDoctorName: '',
    isActive: true,
  };

  doctorOptions: DoctorOption[] = [];

  ngOnInit(): void {
    this.loadDoctorOptions();
    const patientId = Number(this.route.snapshot.paramMap.get('id'));

    if (patientId) {
      this.patientId = patientId;
      this.isEditMode = true;
      this.loadPatient(patientId);
    }
  }

  loadDoctorOptions(): void {
    this.patientsService.getDoctorOptions().subscribe({
      next: (doctorOptions) => {
        this.doctorOptions = doctorOptions;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać listy lekarzy.';
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  getDoctorAssignedName(doctor: DoctorOption): string {
    return `dr ${doctor.firstName} ${doctor.lastName}`;
  }

  getDoctorOptionLabel(doctor: DoctorOption): string {
    const departmentName = doctor.departmentName ? ` — ${doctor.departmentName}` : '';

    return `${this.getDoctorAssignedName(doctor)}${departmentName}`;
  }

  loadPatient(patientId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.patientsService.getPatientById(patientId).subscribe({
      next: (patient) => {
        this.fillForm(patient);
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać danych pacjenta.';
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  savePatient(): void {
    this.errorMessage = '';
    this.isSaving = true;

    if (this.isEditMode && this.patientId) {
      const payload: UpdatePatientPayload = {
        firstName: this.form.firstName.trim(),
        lastName: this.form.lastName.trim(),
        pesel: this.form.pesel.trim(),
        email: this.form.email.trim(),
        assignedDoctorName: this.form.assignedDoctorName.trim() || null,
        isActive: this.form.isActive,
      };

      this.patientsService.updatePatient(this.patientId, payload).subscribe({
        next: (patient) => {
          this.router.navigate(['/patients', patient.id]);
        },
        error: () => {
          this.errorMessage = 'Nie udało się zapisać zmian. Sprawdź dane pacjenta.';
          this.isSaving = false;
          this.changeDetectorRef.detectChanges();
        },
      });

      return;
    }

    const payload: CreatePatientPayload = {
      firstName: this.form.firstName.trim(),
      lastName: this.form.lastName.trim(),
      pesel: this.form.pesel.trim(),
      email: this.form.email.trim(),
      assignedDoctorName: this.form.assignedDoctorName.trim() || null,
    };

    this.patientsService.createPatient(payload).subscribe({
      next: (patient) => {
        this.router.navigate(['/patients', patient.id]);
      },
      error: () => {
        this.errorMessage =
          'Nie udało się dodać pacjenta. Sprawdź, czy email albo PESEL nie istnieją już w systemie.';
        this.isSaving = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  private fillForm(patient: Patient): void {
    this.form = {
      firstName: patient.firstName,
      lastName: patient.lastName,
      pesel: patient.pesel,
      email: patient.email,
      assignedDoctorName: patient.assignedDoctorName ?? '',
      isActive: patient.isActive,
    };
  }
}
