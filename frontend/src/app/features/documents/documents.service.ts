import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PatientDocument } from '../../shared/models/document.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  private readonly apiUrl = '/api/v1/documents';

  constructor(private readonly httpClient: HttpClient) {}

  getDocuments(): Observable<PatientDocument[]> {
    return this.httpClient.get<PatientDocument[]>(this.apiUrl);
  }
}
