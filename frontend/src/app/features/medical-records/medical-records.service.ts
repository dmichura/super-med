import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MedicalRecord } from '../../shared/models/medical-record.model';

@Injectable({
  providedIn: 'root',
})
export class MedicalRecordsService {
  private readonly medicalRecords: MedicalRecord[] = [
    {
      id: 1,
      patientName: 'Jan Kowalski',
      patientPesel: '12345678901',
      doctorName: 'dr Anna Nowak',
      departmentName: 'Oddział Kardiologii',
      type: 'VISIT',
      title: 'Wizyta kontrolna po hospitalizacji',
      createdAt: '2026-06-10',
      status: 'FINAL',
      isSensitive: true,
    },
    {
      id: 2,
      patientName: 'Maria Wiśniewska',
      patientPesel: '98765432109',
      doctorName: 'dr Piotr Zieliński',
      departmentName: 'Oddział Neurologii',
      type: 'DIAGNOSIS',
      title: 'Rozpoznanie neurologiczne',
      createdAt: '2026-06-09',
      status: 'FINAL',
      isSensitive: true,
    },
    {
      id: 3,
      patientName: 'Tomasz Wójcik',
      patientPesel: '11223344556',
      doctorName: 'dr Anna Nowak',
      departmentName: 'Oddział Kardiologii',
      type: 'LAB_RESULT',
      title: 'Wyniki badań laboratoryjnych',
      createdAt: '2026-06-08',
      status: 'DRAFT',
      isSensitive: true,
    },
    {
      id: 4,
      patientName: 'Jan Kowalski',
      patientPesel: '12345678901',
      doctorName: 'dr Anna Nowak',
      departmentName: 'Oddział Kardiologii',
      type: 'PRESCRIPTION',
      title: 'Recepta po konsultacji',
      createdAt: '2026-06-07',
      status: 'ARCHIVED',
      isSensitive: true,
    },
  ];

  getMedicalRecords(): Observable<MedicalRecord[]> {
    // Docelowo: GET /api/v1/medical-records
    return of([...this.medicalRecords]);
  }
}