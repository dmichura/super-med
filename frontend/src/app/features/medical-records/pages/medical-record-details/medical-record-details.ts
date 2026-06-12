import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  MedicalRecord,
  MedicalRecordAuditAction,
  MedicalRecordStatus,
  MedicalRecordType,
} from '../../../../shared/models/medical-record.model';
import { MedicalRecordsService } from '../../medical-records.service';

@Component({
  selector: 'app-medical-record-details',
  imports: [RouterLink],
  templateUrl: './medical-record-details.html',
  styleUrl: './medical-record-details.css',
})
export class MedicalRecordDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly medicalRecordsService = inject(MedicalRecordsService);

  medicalRecord: MedicalRecord | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadMedicalRecord();
  }

  loadMedicalRecord(): void {
    const recordId = Number(this.route.snapshot.paramMap.get('id'));

    if (!recordId) {
      this.errorMessage = 'Nieprawidłowy identyfikator wpisu medycznego.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.medicalRecordsService.getMedicalRecordById(recordId).subscribe({
      next: (medicalRecord) => {
        this.medicalRecord = medicalRecord;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Nie odnaleziono wpisu dokumentacji medycznej.';
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

  getAuditActionLabel(action: MedicalRecordAuditAction): string {
    const labels: Record<MedicalRecordAuditAction, string> = {
      VIEW: 'Odczyt',
      CREATE: 'Utworzenie',
      UPDATE: 'Aktualizacja',
      EXPORT: 'Eksport',
    };

    return labels[action];
  }
}