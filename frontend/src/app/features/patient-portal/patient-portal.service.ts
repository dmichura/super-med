import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PatientPortalDashboardData } from '../../shared/models/patient-portal.model';

@Injectable({
  providedIn: 'root',
})
export class PatientPortalService {
  getDashboardData(): Observable<PatientPortalDashboardData> {
    // Docelowo: GET /api/v1/patient-portal/dashboard
    return of({
      profile: {
        firstName: 'Jan',
        lastName: 'Kowalski',
        pesel: '12345678901',
        email: 'jan.kowalski@supermed.pl',
        isAuthorized: false,
        assignedDoctorName: 'dr Anna Nowak',
      },
      upcomingVisits: [
        {
          id: 1,
          date: '2026-06-18 09:30',
          doctorName: 'dr Anna Nowak',
          departmentName: 'Oddział Kardiologii',
          reason: 'Kontrola po hospitalizacji',
        },
        {
          id: 2,
          date: '2026-06-25 12:00',
          doctorName: 'dr Piotr Zieliński',
          departmentName: 'Oddział Neurologii',
          reason: 'Konsultacja neurologiczna',
        },
      ],
      latestMedicalRecords: [
        {
          id: 1,
          title: 'Wizyta kontrolna po hospitalizacji',
          type: 'Wizyta',
          createdAt: '2026-06-10',
          doctorName: 'dr Anna Nowak',
        },
        {
          id: 2,
          title: 'Recepta po konsultacji',
          type: 'Recepta',
          createdAt: '2026-06-07',
          doctorName: 'dr Anna Nowak',
        },
      ],
      documents: [
        {
          id: 1,
          fileName: 'ekg_jan_kowalski_2026_06_10.pdf',
          type: 'Skan medyczny',
          uploadedAt: '2026-06-10 09:45',
          status: 'Zweryfikowany',
        },
        {
          id: 2,
          fileName: 'wypis_szpitalny_jan_kowalski.pdf',
          type: 'Wypis szpitalny',
          uploadedAt: '2026-06-08 12:10',
          status: 'Zarchiwizowany',
        },
      ],
    });
  }
}