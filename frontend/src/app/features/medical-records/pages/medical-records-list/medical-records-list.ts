import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  MedicalRecord,
  MedicalRecordStatus,
  MedicalRecordType,
} from '../../../../shared/models/medical-record.model';
import { MedicalRecordsService } from '../../medical-records.service';

@Component({
  selector: 'app-medical-records-list',
  imports: [RouterLink],
  templateUrl: './medical-records-list.html',
  styleUrl: './medical-records-list.css',
})
export class MedicalRecordsList implements OnInit {
  private readonly medicalRecordsService = inject(MedicalRecordsService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  medicalRecords: MedicalRecord[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadMedicalRecords();
  }

  loadMedicalRecords(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.medicalRecordsService.getMedicalRecords().subscribe({
      next: (medicalRecords) => {
        this.medicalRecords = medicalRecords;
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać dokumentacji medycznej.';
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  getTypeLabel(type: MedicalRecordType): string {
    const labels: Record<MedicalRecordType, string> = {
      VISIT: 'Wizyta',
      DIAGNOSIS: 'Rozpoznanie',
      PRESCRIPTION: 'Recepta',
      LAB_RESULT: 'Wynik badania',
      DISCHARGE_SUMMARY: 'Wypis',
    };

    return labels[type];
  }

  getStatusLabel(status: MedicalRecordStatus): string {
    const labels: Record<MedicalRecordStatus, string> = {
      DRAFT: 'Roboczy',
      FINAL: 'Zatwierdzony',
      ARCHIVED: 'Zarchiwizowany',
    };

    return labels[status];
  }
}
