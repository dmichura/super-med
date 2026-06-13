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

  createDocumentWithFile(payload: CreateDocumentPayload, file: File): Observable<PatientDocument> {
    const formData = this.createDocumentFormData(payload, file);

    return this.httpClient.post<PatientDocument>(`${this.apiUrl}/upload`, formData);
  }

  updateDocument(documentId: number, payload: UpdateDocumentPayload): Observable<PatientDocument> {
    return this.httpClient.patch<PatientDocument>(`${this.apiUrl}/${documentId}`, payload);
  }

  updateDocumentWithOptionalFile(
    documentId: number,
    payload: UpdateDocumentPayload,
    file: File | null,
  ): Observable<PatientDocument> {
    const formData = this.createDocumentFormData(payload, file);

    return this.httpClient.patch<PatientDocument>(`${this.apiUrl}/${documentId}/upload`, formData);
  }

  deleteDocument(documentId: number): Observable<PatientDocument[]> {
    return this.httpClient.delete<PatientDocument[]>(`${this.apiUrl}/${documentId}`);
  }

  downloadDocument(documentId: number): Observable<Blob> {
    return this.httpClient.get(`${this.apiUrl}/${documentId}/download`, {
      responseType: 'blob',
    });
  }

  getPatientOptions(): Observable<DocumentPatientOption[]> {
    return this.httpClient.get<DocumentPatientOption[]>(this.patientsApiUrl);
  }

  private createDocumentFormData(
    payload: CreateDocumentPayload | UpdateDocumentPayload,
    file: File | null,
  ): FormData {
    const formData = new FormData();

    if (payload.patientId !== undefined) {
      formData.append('patientId', String(payload.patientId));
    }

    if (payload.type !== undefined) {
      formData.append('type', payload.type);
    }

    if (payload.fileName !== undefined) {
      formData.append('fileName', payload.fileName);
    }

    if (payload.status !== undefined) {
      formData.append('status', payload.status);
    }

    if (payload.isSensitive !== undefined) {
      formData.append('isSensitive', String(payload.isSensitive));
    }

    if (file) {
      formData.append('file', file);
    }

    return formData;
  }
}
