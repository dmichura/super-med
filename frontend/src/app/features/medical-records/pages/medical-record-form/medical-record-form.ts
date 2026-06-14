import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  CreateMedicalRecordPayload,
  MedicalRecord,
  MedicalRecordDepartmentOption,
  MedicalRecordDoctorOption,
  MedicalRecordPatientOption,
  MedicalRecordStatus,
  MedicalRecordType,
  UpdateMedicalRecordPayload,
} from '../../../../shared/models/medical-record.model';
import { MedicalRecordsService } from '../../medical-records.service';

interface MedicalRecordFormState {
  patientId: number | null;
  doctorName: string;
  departmentName: string;
  type: MedicalRecordType;
  title: string;
  status: MedicalRecordStatus;
  isSensitive: boolean;
  description: string;
}

@Component({
  selector: 'app-medical-record-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './medical-record-form.html',
  styleUrl: './medical-record-form.css',
})
export class MedicalRecordForm implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly medicalRecordsService = inject(MedicalRecordsService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  recordId: number | null = null;
  loadedMedicalRecord: MedicalRecord | null = null;

  isEditMode = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  patientOptions: MedicalRecordPatientOption[] = [];
  doctorOptions: MedicalRecordDoctorOption[] = [];
  departmentOptions: MedicalRecordDepartmentOption[] = [];

  readonly typeOptions: Array<{
    value: MedicalRecordType;
    label: string;
  }> = [
    { value: 'VISIT', label: 'Wizyta' },
    { value: 'DIAGNOSIS', label: 'Rozpoznanie' },
    { value: 'PRESCRIPTION', label: 'Recepta' },
    { value: 'LAB_RESULT', label: 'Wynik badania' },
    { value: 'DISCHARGE_SUMMARY', label: 'Wypis' },
  ];

  readonly statusOptions: Array<{
    value: MedicalRecordStatus;
    label: string;
  }> = [
    { value: 'DRAFT', label: 'Roboczy' },
    { value: 'FINAL', label: 'Zatwierdzony' },
    { value: 'ARCHIVED', label: 'Zarchiwizowany' },
  ];

  form: MedicalRecordFormState = {
    patientId: null,
    doctorName: '',
    departmentName: '',
    type: 'VISIT',
    title: '',
    status: 'DRAFT',
    isSensitive: true,
    description: '',
  };

  ngOnInit(): void {
    this.loadPatientOptions();
    this.loadDoctorOptions();
    this.loadDepartmentOptions();

    const recordId = Number(this.route.snapshot.paramMap.get('id'));

    if (recordId) {
      this.recordId = recordId;
      this.isEditMode = true;
      this.loadMedicalRecord(recordId);
    }
  }

  loadMedicalRecord(recordId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.medicalRecordsService.getMedicalRecordById(recordId).subscribe({
      next: (medicalRecord) => {
        this.loadedMedicalRecord = medicalRecord;
        this.fillForm(medicalRecord);
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać wpisu medycznego.';
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  loadPatientOptions(): void {
    this.medicalRecordsService.getPatientOptions().subscribe({
      next: (patientOptions) => {
        this.patientOptions = patientOptions;

        if (this.loadedMedicalRecord && !this.form.patientId) {
          this.form.patientId = this.findPatientIdByPesel(
            this.loadedMedicalRecord.patientPesel,
          );
        }

        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać listy pacjentów.';
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  loadDoctorOptions(): void {
    this.medicalRecordsService.getDoctorOptions().subscribe({
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

  loadDepartmentOptions(): void {
    this.medicalRecordsService.getDepartmentOptions().subscribe({
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

  saveMedicalRecord(): void {
    if (!this.form.patientId) {
      this.errorMessage = 'Wybierz pacjenta.';
      return;
    }

    this.errorMessage = '';
    this.isSaving = true;

    if (this.isEditMode && this.recordId) {
      const payload: UpdateMedicalRecordPayload = {
        patientId: this.form.patientId,
        doctorName: this.form.doctorName.trim(),
        departmentName: this.form.departmentName.trim(),
        type: this.form.type,
        title: this.form.title.trim(),
        status: this.form.status,
        isSensitive: this.form.isSensitive,
        description: this.form.description.trim(),
      };

      this.medicalRecordsService
        .updateMedicalRecord(this.recordId, payload)
        .subscribe({
          next: (medicalRecord) => {
            this.router.navigate(['/medical-records', medicalRecord.id]);
          },
          error: () => {
            this.errorMessage =
              'Nie udało się zapisać zmian. Sprawdź dane formularza.';
            this.isSaving = false;
            this.changeDetectorRef.detectChanges();
          },
        });

      return;
    }

    const payload: CreateMedicalRecordPayload = {
      patientId: this.form.patientId,
      doctorName: this.form.doctorName.trim(),
      departmentName: this.form.departmentName.trim(),
      type: this.form.type,
      title: this.form.title.trim(),
      status: this.form.status,
      isSensitive: this.form.isSensitive,
      description: this.form.description.trim(),
    };

    this.medicalRecordsService.createMedicalRecord(payload).subscribe({
      next: (medicalRecord) => {
        this.router.navigate(['/medical-records', medicalRecord.id]);
      },
      error: () => {
        this.errorMessage =
          'Nie udało się dodać wpisu medycznego. Sprawdź dane formularza.';
        this.isSaving = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  getPatientOptionLabel(patient: MedicalRecordPatientOption): string {
    const authorizationStatus = patient.isAuthorized
      ? 'zweryfikowany'
      : 'oczekuje';

    return `${patient.firstName} ${patient.lastName} · PESEL ${patient.pesel} · ${authorizationStatus}`;
  }

  getDoctorAssignedName(doctor: MedicalRecordDoctorOption): string {
    return `dr ${doctor.firstName} ${doctor.lastName}`;
  }

  getDoctorOptionLabel(doctor: MedicalRecordDoctorOption): string {
    const departmentName = doctor.departmentName
      ? ` — ${doctor.departmentName}`
      : '';

    return `${this.getDoctorAssignedName(doctor)}${departmentName}`;
  }

  getDepartmentOptionLabel(department: MedicalRecordDepartmentOption): string {
    return `${department.name} (${department.code}, piętro ${department.floor})`;
  }

  hasSelectedDoctorInOptions(): boolean {
    if (!this.form.doctorName) {
      return true;
    }

    return this.doctorOptions.some(
      (doctor) => this.getDoctorAssignedName(doctor) === this.form.doctorName,
    );
  }

  hasSelectedDepartmentInOptions(): boolean {
    if (!this.form.departmentName) {
      return true;
    }

    return this.departmentOptions.some(
      (department) => department.name === this.form.departmentName,
    );
  }

  private fillForm(medicalRecord: MedicalRecord): void {
    this.form = {
      patientId: this.findPatientIdByPesel(medicalRecord.patientPesel),
      doctorName: medicalRecord.doctorName,
      departmentName: medicalRecord.departmentName,
      type: medicalRecord.type,
      title: medicalRecord.title,
      status: medicalRecord.status,
      isSensitive: medicalRecord.isSensitive,
      description: medicalRecord.description,
    };
  }

  private findPatientIdByPesel(pesel: string): number | null {
    return (
      this.patientOptions.find((patient) => patient.pesel === pesel)?.id ?? null
    );
  }
}
