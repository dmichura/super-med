import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
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
      description:
        'Pacjent zgłosił się na kontrolę po hospitalizacji. Zalecono dalszą obserwację, kontrolę ciśnienia oraz kontynuację leczenia.',
      auditTrail: [
        {
          id: 1,
          actorName: 'dr Anna Nowak',
          action: 'CREATE',
          accessedAt: '2026-06-10 09:15',
          reason: 'Utworzenie wpisu po wizycie kontrolnej.',
        },
        {
          id: 2,
          actorName: 'Katarzyna Wójcik',
          action: 'VIEW',
          accessedAt: '2026-06-10 10:20',
          reason: 'Weryfikacja zaleceń pielęgniarskich.',
        },
      ],
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
      description:
        'Opis rozpoznania neurologicznego pacjentki. Dokument zawiera dane wrażliwe i wymaga pełnego audytu dostępu.',
      auditTrail: [
        {
          id: 1,
          actorName: 'dr Piotr Zieliński',
          action: 'CREATE',
          accessedAt: '2026-06-09 13:40',
          reason: 'Utworzenie rozpoznania.',
        },
      ],
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
      description:
        'Wstępny wpis dotyczący wyników badań laboratoryjnych. Dokument pozostaje w statusie roboczym.',
      auditTrail: [
        {
          id: 1,
          actorName: 'dr Anna Nowak',
          action: 'CREATE',
          accessedAt: '2026-06-08 08:55',
          reason: 'Dodanie wyników badań.',
        },
      ],
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
      description:
        'Archiwalny wpis recepty wystawionej po konsultacji kardiologicznej.',
      auditTrail: [
        {
          id: 1,
          actorName: 'dr Anna Nowak',
          action: 'CREATE',
          accessedAt: '2026-06-07 11:30',
          reason: 'Wystawienie recepty.',
        },
        {
          id: 2,
          actorName: 'Michał Kamiński',
          action: 'EXPORT',
          accessedAt: '2026-06-07 12:05',
          reason: 'Test eksportu dokumentu do systemu EDM.',
        },
      ],
    },
  ];

  getMedicalRecords(): Observable<MedicalRecord[]> {
    // Docelowo: GET /api/v1/medical-records
    return of([...this.medicalRecords]);
  }

  getMedicalRecordById(recordId: number): Observable<MedicalRecord> {
    const record = this.medicalRecords.find((item) => item.id === recordId);

    if (!record) {
      return throwError(() => new Error('Medical record not found'));
    }

    // Docelowo: GET /api/v1/medical-records/:id
    return of({ ...record, auditTrail: [...record.auditTrail] });
  }
}