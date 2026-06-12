import { Component, OnInit, inject } from '@angular/core';
import {
  MedicalRecord,
  MedicalRecordStatus,
  MedicalRecordType,
} from '../../../../shared/models/medical-record.model';
import { MedicalRecordsService } from '../../medical-records.service';

@Component({
  selector: 'app-medical-records-list',
  imports: [],
  templateUrl: './medical-records-list.html',
  styleUrl: './medical-records-list.css',
})
export class MedicalRecordsList implements OnInit {
  private readonly medicalRecordsService = inject(MedicalRecordsService);

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
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać dokumentacji medycznej.';
        this.isLoading = false;
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