import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Patient } from '../../shared/models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  private readonly patients: Patient[] = [
    {
      id: 1,
      firstName: 'Jan',
      lastName: 'Kowalski',
      pesel: '12345678901',
      email: 'jan.kowalski@supermed.pl',
      isAuthorized: false,
      assignedDoctorName: 'dr Anna Nowak',
      isActive: true,
    },
    {
      id: 2,
      firstName: 'Maria',
      lastName: 'Wiśniewska',
      pesel: '98765432109',
      email: 'maria.wisniewska@supermed.pl',
      isAuthorized: true,
      assignedDoctorName: 'dr Piotr Zieliński',
      isActive: true,
    },
    {
      id: 3,
      firstName: 'Tomasz',
      lastName: 'Wójcik',
      pesel: '11223344556',
      email: 'tomasz.wojcik@supermed.pl',
      isAuthorized: true,
      assignedDoctorName: null,
      isActive: false,
    },
  ];

  getPatients(): Observable<Patient[]> {
    // Docelowo: GET /api/v1/patients
    return of([...this.patients]);
  }

  getPatientById(patientId: number): Observable<Patient> {
    const patient = this.patients.find((item) => item.id === patientId);

    if (!patient) {
      return throwError(() => new Error('Patient not found'));
    }

    // Docelowo: GET /api/v1/patients/:id
    return of({ ...patient });
  }

  authorizePatient(patientId: number): Observable<Patient> {
    const patient = this.patients.find((item) => item.id === patientId);

    if (!patient) {
      return throwError(() => new Error('Patient not found'));
    }

    patient.isAuthorized = true;

    // Docelowo: PATCH /api/v1/patients/:id/authorize
    return of({ ...patient });
  }
}