import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateDocumentPayload,
  DocumentPatientOption,
  PatientDocument,
  UpdateDocumentPayload,
} from '../../shared/models/document.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  private readonly apiUrl = '/api/v1/documents';
  private readonly patientsApiUrl = '/api/v1/patients';

  constructor(private readonly httpClient: HttpClient) {}

  getDocuments(): Observable<PatientDocument[]> {
    return this.httpClient.get<PatientDocument[]>(this.apiUrl);
  }

  createDocument(payload: CreateDocumentPayload): Observable<PatientDocument> {
    return this.httpClient.post<PatientDocument>(this.apiUrl, payload);
  }

  updateDocument(documentId: number, payload: UpdateDocumentPayload): Observable<PatientDocument> {
    return this.httpClient.patch<PatientDocument>(`${this.apiUrl}/${documentId}`, payload);
  }

  deleteDocument(documentId: number): Observable<PatientDocument[]> {
    return this.httpClient.delete<PatientDocument[]>(`${this.apiUrl}/${documentId}`);
  }

  getPatientOptions(): Observable<DocumentPatientOption[]> {
    return this.httpClient.get<DocumentPatientOption[]>(this.patientsApiUrl);
  }
}
