import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

const ACCESS_TOKEN_KEY = 'supermed_access_token';
const AUTH_USER_KEY = 'supermed_auth_user';

export type UserRole = 'ADMIN' | 'DIRECTOR' | 'EMPLOYEE' | 'PATIENT';

export type UserStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PENDING_VERIFICATION'
  | 'BLOCKED';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterPatientPayload {
  firstName: string;
  lastName: string;
  pesel: string;
  email: string;
  password: string;
}

export interface RegisterPatientResponse {
  message: string;
  user: AuthUser;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = '/api/v1/auth';

  constructor(
    private readonly httpClient: HttpClient,
    private readonly router: Router,
  ) {}

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  getAuthenticatedUser(): AuthUser | null {
    const rawUser = localStorage.getItem(AUTH_USER_KEY);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      this.clearSession();
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.httpClient
      .post<LoginResponse>(`${this.apiUrl}/login`, payload)
      .pipe(
        tap((response) => {
          this.setAccessToken(response.accessToken);
          this.setAuthenticatedUser(response.user);
        }),
      );
  }

  registerPatient(
    payload: RegisterPatientPayload,
  ): Observable<RegisterPatientResponse> {
    return this.httpClient.post<RegisterPatientResponse>(
      `${this.apiUrl}/register-patient`,
      payload,
    );
  }

  getCurrentUser(): Observable<AuthUser> {
    return this.httpClient.get<AuthUser>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        this.setAuthenticatedUser(user);
      }),
    );
  }

  hasAllowedRole(allowedRoles: UserRole[]): boolean {
    const user = this.getAuthenticatedUser();

    if (!user) {
      return false;
    }

    return allowedRoles.includes(user.role);
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  private setAuthenticatedUser(user: AuthUser): void {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
}