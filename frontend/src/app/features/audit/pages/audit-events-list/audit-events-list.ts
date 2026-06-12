import { Component, OnInit, inject } from '@angular/core';
import {
  AuditAction,
  AuditEvent,
  AuditResourceType,
  AuditResult,
} from '../../../../shared/models/audit-event.model';
import { AuditService } from '../../audit.service';

@Component({
  selector: 'app-audit-events-list',
  imports: [],
  templateUrl: './audit-events-list.html',
  styleUrl: './audit-events-list.css',
})
export class AuditEventsList implements OnInit {
  private readonly auditService = inject(AuditService);

  auditEvents: AuditEvent[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadAuditEvents();
  }

  loadAuditEvents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.auditService.getAuditEvents().subscribe({
      next: (auditEvents) => {
        this.auditEvents = auditEvents;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać zdarzeń audytu.';
        this.isLoading = false;
      },
    });
  }

  getActionLabel(action: AuditAction): string {
    const labels: Record<AuditAction, string> = {
      LOGIN: 'Logowanie',
      LOGOUT: 'Wylogowanie',
      VIEW: 'Odczyt',
      CREATE: 'Utworzenie',
      UPDATE: 'Aktualizacja',
      DELETE: 'Usunięcie',
      EXPORT: 'Eksport',
      AUTHORIZE: 'Autoryzacja',
    };

    return labels[action];
  }

  getResourceTypeLabel(resourceType: AuditResourceType): string {
    const labels: Record<AuditResourceType, string> = {
      AUTH: 'Autoryzacja',
      PATIENT: 'Pacjent',
      EMPLOYEE: 'Pracownik',
      MEDICAL_RECORD: 'Dokumentacja medyczna',
      HOSPITAL_STRUCTURE: 'Struktura szpitala',
      REPORT: 'Raport',
    };

    return labels[resourceType];
  }

  getResultLabel(result: AuditResult): string {
    const labels: Record<AuditResult, string> = {
      SUCCESS: 'Sukces',
      DENIED: 'Odmowa',
      ERROR: 'Błąd',
    };

    return labels[result];
  }
}