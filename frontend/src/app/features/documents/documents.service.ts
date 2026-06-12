import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PatientDocument } from '../../shared/models/document.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  private readonly documents: PatientDocument[] = [
    {
      id: 1,
      patientName: 'Jan Kowalski',
      patientPesel: '12345678901',
      type: 'MEDICAL_SCAN',
      fileName: 'ekg_jan_kowalski_2026_06_10.pdf',
      status: 'VERIFIED',
      uploadedBy: 'dr Anna Nowak',
      uploadedAt: '2026-06-10 09:45',
      isSensitive: true,
    },
    {
      id: 2,
      patientName: 'Maria Wiśniewska',
      patientPesel: '98765432109',
      type: 'LAB_ATTACHMENT',
      fileName: 'wyniki_laboratoryjne_maria_wisniewska.pdf',
      status: 'UPLOADED',
      uploadedBy: 'Katarzyna Wójcik',
      uploadedAt: '2026-06-10 10:30',
      isSensitive: true,
    },
    {
      id: 3,
      patientName: 'Tomasz Wójcik',
      patientPesel: '11223344556',
      type: 'CONSENT',
      fileName: 'zgoda_na_przetwarzanie_danych.pdf',
      status: 'VERIFIED',
      uploadedBy: 'Recepcja',
      uploadedAt: '2026-06-09 14:15',
      isSensitive: false,
    },
    {
      id: 4,
      patientName: 'Jan Kowalski',
      patientPesel: '12345678901',
      type: 'DISCHARGE_FILE',
      fileName: 'wypis_szpitalny_jan_kowalski.pdf',
      status: 'ARCHIVED',
      uploadedBy: 'dr Anna Nowak',
      uploadedAt: '2026-06-08 12:10',
      isSensitive: true,
    },
  ];

  getDocuments(): Observable<PatientDocument[]> {
    // Docelowo: GET /api/v1/documents
    return of([...this.documents]);
  }
}