import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService, UserRole } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const allowedRoles = route.data?.['roles'] as UserRole[] | undefined;

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const storedUser = authService.getAuthenticatedUser();

  if (storedUser) {
    return allowedRoles.includes(storedUser.role)
      ? true
      : router.createUrlTree(['/dashboard']);
  }

  return authService.getCurrentUser().pipe(
    map((currentUser) =>
      allowedRoles.includes(currentUser.role)
        ? true
        : router.createUrlTree(['/dashboard']),
    ),
    catchError(() => {
      authService.clearSession();
      return of(router.createUrlTree(['/login']));
    }),
  );
};