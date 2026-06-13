import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService, AuthUser, UserRole } from '../../../../core/auth/auth.service';
import { ReportDashboardData } from '../../../../shared/models/report.model';
import { ReportsService } from '../../../reports/reports.service';

interface DashboardAction {
  title: string;
  description: string;
  route: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly reportsService = inject(ReportsService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  currentUser: AuthUser | null = null;
  reportData: ReportDashboardData | null = null;

  isLoadingReport = false;
  reportErrorMessage = '';

  readonly dashboardActions: DashboardAction[] = [
    {
      title: 'Pacjenci',
      description: 'Dodawanie, edycja, autoryzacja i przegląd kart pacjentów.',
      route: '/patients',
      roles: ['ADMIN', 'EMPLOYEE'],
    },
    {
      title: 'Pracownicy',
      description: 'Zarządzanie kontami, rolami i funkcjami pracowników.',
      route: '/employees',
      roles: ['ADMIN', 'DIRECTOR'],
    },
    {
      title: 'Struktura szpitala',
      description: 'Oddziały, sale, łóżka oraz przypisanie pacjentów.',
      route: '/hospital-structure',
      roles: ['ADMIN', 'DIRECTOR', 'EMPLOYEE'],
    },
    {
      title: 'Dokumentacja medyczna',
      description: 'Tworzenie i edycja wpisów dokumentacji medycznej.',
      route: '/medical-records',
      roles: ['ADMIN', 'EMPLOYEE'],
    },
    {
      title: 'Dokumenty',
      description: 'Lista dokumentów pacjentów i metadane plików medycznych.',
      route: '/documents',
      roles: ['ADMIN', 'EMPLOYEE'],
    },
    {
      title: 'Raporty',
      description: 'Raport operacyjny szpitala i obłożenie oddziałów.',
      route: '/reports',
      roles: ['ADMIN', 'DIRECTOR'],
    },
    {
      title: 'Audyt',
      description: 'Zdarzenia dostępu, operacje krytyczne i kontrola zmian.',
      route: '/audit',
      roles: ['ADMIN', 'DIRECTOR'],
    },
    {
      title: 'Portal pacjenta',
      description: 'Panel pacjenta z dostępem do informacji medycznych.',
      route: '/patient-portal',
      roles: ['PATIENT'],
    },
  ];

  ngOnInit(): void {
    this.currentUser = this.authService.getAuthenticatedUser();

    if (this.canSeeOperationalSummary) {
      this.loadDashboardReport();
    }
  }

  get canSeeOperationalSummary(): boolean {
    return this.authService.hasAllowedRole(['ADMIN', 'DIRECTOR']);
  }

  get visibleActions(): DashboardAction[] {
    const role = this.currentUser?.role;

    if (!role) {
      return [];
    }

    return this.dashboardActions.filter((action) => action.roles.includes(role));
  }

  get roleLabel(): string {
    const labels: Record<UserRole, string> = {
      ADMIN: 'Administrator',
      DIRECTOR: 'Dyrektor',
      EMPLOYEE: 'Pracownik medyczny',
      PATIENT: 'Pacjent',
    };

    return this.currentUser ? labels[this.currentUser.role] : 'Użytkownik';
  }

  get totalBeds(): number {
    if (!this.reportData) {
      return 0;
    }

    return this.reportData.departmentOccupancy.reduce(
      (sum, department) => sum + department.totalBeds,
      0,
    );
  }

  get occupancyPercent(): number {
    if (!this.reportData || this.totalBeds === 0) {
      return 0;
    }

    return Math.round((this.reportData.summary.occupiedBeds / this.totalBeds) * 100);
  }

  loadDashboardReport(): void {
    this.isLoadingReport = true;
    this.reportErrorMessage = '';

    this.reportsService.getDashboardReport().subscribe({
      next: (reportData) => {
        this.reportData = reportData;
        this.isLoadingReport = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.reportErrorMessage = 'Nie udało się pobrać danych dashboardu.';
        this.isLoadingReport = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  getOccupancyPercent(totalBeds: number, occupiedBeds: number): number {
    if (totalBeds === 0) {
      return 0;
    }

    return Math.round((occupiedBeds / totalBeds) * 100);
  }
}
