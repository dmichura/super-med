import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, UserRole } from '../../core/auth/auth.service';

interface SidebarNavItem {
  label: string;
  path: string;
  roles: UserRole[] | null;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly authService = inject(AuthService);

  private readonly navItems: SidebarNavItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      roles: null,
    },
    {
      label: 'Portal pacjenta',
      path: '/patient-portal',
      roles: ['PATIENT'],
    },
    {
      label: 'Pacjenci',
      path: '/patients',
      roles: ['ADMIN', 'EMPLOYEE'],
    },
    {
      label: 'Pracownicy',
      path: '/employees',
      roles: ['ADMIN', 'DIRECTOR'],
    },
    {
      label: 'Oddziały i łóżka',
      path: '/hospital-structure',
      roles: ['ADMIN', 'DIRECTOR', 'EMPLOYEE'],
    },
    {
      label: 'Dokumentacja',
      path: '/medical-records',
      roles: ['ADMIN', 'EMPLOYEE'],
    },
    {
      label: 'Raporty',
      path: '/reports',
      roles: ['ADMIN', 'DIRECTOR'],
    },
    {
      label: 'Dokumenty',
      path: '/documents',
      roles: ['ADMIN', 'EMPLOYEE'],
    },
    {
      label: 'Audyt',
      path: '/audit',
      roles: ['ADMIN', 'DIRECTOR'],
    },
  ];

  get visibleNavItems(): SidebarNavItem[] {
    const user = this.authService.getAuthenticatedUser();

    if (!user) {
      return [];
    }

    return this.navItems.filter((item) => {
      if (!item.roles) {
        return true;
      }

      return item.roles.includes(user.role);
    });
  }
}
