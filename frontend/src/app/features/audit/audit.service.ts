import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuditEvent } from '../../shared/models/audit-event.model';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private readonly auditEvents: AuditEvent[] = [
    {
      id: 1,
      actorName: 'dr Anna Nowak',
      actorRole: 'EMPLOYEE',
      action: 'VIEW',
      resourceType: 'MEDICAL_RECORD',
      resourceName: 'Wizyta kontrolna po hospitalizacji',
      occurredAt: '2026-06-10 10:20',
      ipAddress: '192.168.1.21',
      result: 'SUCCESS',
      reason: 'Odczyt dokumentacji pacjenta podczas opieki medycznej.',
    },
    {
      id: 2,
      actorName: 'Katarzyna Wójcik',
      actorRole: 'EMPLOYEE',
      action: 'AUTHORIZE',
      resourceType: 'PATIENT',
      resourceName: 'Jan Kowalski',
      occurredAt: '2026-06-10 11:05',
      ipAddress: '192.168.1.34',
      result: 'SUCCESS',
      reason: 'Osobista weryfikacja tożsamości pacjenta w placówce.',
    },
    {
      id: 3,
      actorName: 'Michał Kamiński',
      actorRole: 'ADMIN',
      action: 'UPDATE',
      resourceType: 'EMPLOYEE',
      resourceName: 'Ewa Lewandowska',
      occurredAt: '2026-06-10 12:15',
      ipAddress: '192.168.1.10',
      result: 'SUCCESS',
      reason: 'Zmiana statusu konta pracownika.',
    },
    {
      id: 4,
      actorName: 'Nieznany użytkownik',
      actorRole: 'ANONYMOUS',
      action: 'LOGIN',
      resourceType: 'AUTH',
      resourceName: 'Panel SuperMED',
      occurredAt: '2026-06-10 13:02',
      ipAddress: '10.0.0.45',
      result: 'DENIED',
      reason: 'Nieprawidłowe dane logowania.',
    },
    {
      id: 5,
      actorName: 'Dyrektor placówki',
      actorRole: 'DIRECTOR',
      action: 'VIEW',
      resourceType: 'REPORT',
      resourceName: 'Dashboard raportowy',
      occurredAt: '2026-06-10 14:30',
      ipAddress: '192.168.1.5',
      result: 'SUCCESS',
      reason: 'Analiza obłożenia oddziałów.',
    },
    {
      id: 6,
      actorName: 'dr Piotr Zieliński',
      actorRole: 'EMPLOYEE',
      action: 'EXPORT',
      resourceType: 'MEDICAL_RECORD',
      resourceName: 'Rozpoznanie neurologiczne',
      occurredAt: '2026-06-10 15:12',
      ipAddress: '192.168.1.22',
      result: 'SUCCESS',
      reason: 'Eksport dokumentacji do systemu EDM.',
    },
  ];

  getAuditEvents(): Observable<AuditEvent[]> {
    // Docelowo: GET /api/v1/audit/events
    return of([...this.auditEvents]);
  }
}