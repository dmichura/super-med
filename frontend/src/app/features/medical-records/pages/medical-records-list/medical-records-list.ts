import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  MedicalRecord,
  MedicalRecordStatus,
  MedicalRecordType,
} from '../../../../shared/models/medical-record.model';
import { MedicalRecordsService } from '../../medical-records.service';

type TypeFilter = 'ALL' | MedicalRecordType;
type StatusFilter = 'ALL' | MedicalRecordStatus;
type SensitiveFilter = 'ALL' | 'SENSITIVE' | 'STANDARD';

@Component({
  selector: 'app-medical-records-list',
  imports: [RouterLink, FormsModule],
  templateUrl: './medical-records-list.html',
  styleUrl: './medical-records-list.css',
})
export class MedicalRecordsList implements OnInit {
  private readonly medicalRecordsService = inject(MedicalRecordsService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  medicalRecords: MedicalRecord[] = [];
  searchTerm = '';
  typeFilter: TypeFilter = 'ALL';
  statusFilter: StatusFilter = 'ALL';
  sensitiveFilter: SensitiveFilter = 'ALL';
  isLoading = true;
  isDeletingRecordId: number | null = null;
  errorMessage = '';

  ngOnInit(): void {
    this.loadMedicalRecords();
  }

  get filteredMedicalRecords(): MedicalRecord[] {
    const searchValue = this.searchTerm.trim().toLowerCase();

    return this.medicalRecords.filter((record) => {
      const matchesSearch =
        !searchValue ||
        record.patientName.toLowerCase().includes(searchValue) ||
        record.patientPesel.includes(searchValue) ||
        record.doctorName.toLowerCase().includes(searchValue) ||
        record.departmentName.toLowerCase().includes(searchValue) ||
        record.title.toLowerCase().includes(searchValue) ||
        this.getTypeLabel(record.type).toLowerCase().includes(searchValue);

      const matchesType = this.typeFilter === 'ALL' || record.type === this.typeFilter;

      const matchesStatus = this.statusFilter === 'ALL' || record.status === this.statusFilter;

      const matchesSensitive =
        this.sensitiveFilter === 'ALL' ||
        (this.sensitiveFilter === 'SENSITIVE' && record.isSensitive) ||
        (this.sensitiveFilter === 'STANDARD' && !record.isSensitive);

      return matchesSearch && matchesType && matchesStatus && matchesSensitive;
    });
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

  deleteMedicalRecord(record: MedicalRecord): void {
    const confirmed = confirm(`Czy na pewno usunąć wpis medyczny "${record.title}"?`);

    if (!confirmed) {
      return;
    }

    this.isDeletingRecordId = record.id;
    this.errorMessage = '';

    this.medicalRecordsService.deleteMedicalRecord(record.id).subscribe({
      next: (medicalRecords) => {
        this.medicalRecords = medicalRecords;
        this.isDeletingRecordId = null;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Nie udało się usunąć wpisu medycznego.';
        this.isDeletingRecordId = null;
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
