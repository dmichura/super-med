import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Patient } from '../../shared/models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  getPatients(): Observable<Patient[]> {
    // Dane testowe do czasu podłączenia backendu:
    // GET /api/v1/patients
    return of([
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
    ]).pipe(delay(250));
  }
}