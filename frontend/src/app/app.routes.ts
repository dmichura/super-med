import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { MainLayout } from './layout/main-layout/main-layout';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register').then((m) => m.Register),
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard').then(
            (m) => m.Dashboard,
          ),
      },
      {
        path: 'patients',
        canActivate: [roleGuard],
        data: {
            roles: ['ADMIN', 'EMPLOYEE'],
        },
        loadComponent: () =>
            import('./features/patients/pages/patients-list/patients-list').then(
            (m) => m.PatientsList,
        ),
        },
        {
        path: 'patients/:id',
        canActivate: [roleGuard],
        data: {
            roles: ['ADMIN', 'EMPLOYEE'],
        },
        loadComponent: () =>
            import('./features/patients/pages/patient-details/patient-details').then(
            (m) => m.PatientDetails,
            ),
        },
        {
        path: 'employees',
        canActivate: [roleGuard],
        data: {
            roles: ['ADMIN', 'DIRECTOR'],
        },
        loadComponent: () =>
            import('./features/employees/pages/employees-list/employees-list').then(
            (m) => m.EmployeesList,
            ),
        },
        {
        path: 'hospital-structure',
        canActivate: [roleGuard],
        data: {
            roles: ['ADMIN', 'DIRECTOR', 'EMPLOYEE'],
        },
        loadComponent: () =>
            import(
            './features/hospital-structure/pages/hospital-structure-list/hospital-structure-list'
            ).then((m) => m.HospitalStructureList),
        },
        
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];