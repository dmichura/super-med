import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HospitalDepartment } from '../../shared/models/hospital-structure.model';

@Injectable({
  providedIn: 'root',
})
export class HospitalStructureService {
  private readonly departments: HospitalDepartment[] = [
    {
      id: 1,
      name: 'Oddział Kardiologii',
      code: 'CARD',
      floor: 2,
      headDoctorName: 'dr Anna Nowak',
      rooms: [
        {
          id: 1,
          number: '201',
          type: 'Sala dwuosobowa',
          beds: [
            {
              id: 1,
              number: '201-A',
              status: 'OCCUPIED',
              patientName: 'Jan Kowalski',
            },
            {
              id: 2,
              number: '201-B',
              status: 'FREE',
              patientName: null,
            },
          ],
        },
        {
          id: 2,
          number: '202',
          type: 'Sala jednoosobowa',
          beds: [
            {
              id: 3,
              number: '202-A',
              status: 'CLEANING',
              patientName: null,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Oddział Neurologii',
      code: 'NEURO',
      floor: 3,
      headDoctorName: 'dr Piotr Zieliński',
      rooms: [
        {
          id: 3,
          number: '301',
          type: 'Sala trzyosobowa',
          beds: [
            {
              id: 4,
              number: '301-A',
              status: 'FREE',
              patientName: null,
            },
            {
              id: 5,
              number: '301-B',
              status: 'BLOCKED',
              patientName: null,
            },
            {
              id: 6,
              number: '301-C',
              status: 'OCCUPIED',
              patientName: 'Maria Wiśniewska',
            },
          ],
        },
      ],
    },
  ];

  getDepartments(): Observable<HospitalDepartment[]> {
    // Docelowo: GET /api/v1/hospital-structure/departments
    return of([...this.departments]);
  }
}