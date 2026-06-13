import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HospitalDepartment } from '../../shared/models/hospital-structure.model';

@Injectable({
  providedIn: 'root',
})
export class HospitalStructureService {
  private readonly apiUrl = '/api/v1/hospital-structure/departments';

  constructor(private readonly httpClient: HttpClient) {}

  getDepartments(): Observable<HospitalDepartment[]> {
    return this.httpClient.get<HospitalDepartment[]>(this.apiUrl);
  }
}
