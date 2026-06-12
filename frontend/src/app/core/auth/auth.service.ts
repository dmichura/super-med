import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const ACCESS_TOKEN_KEY = 'supermed_access_token';

export interface PatientRegisterMockPayload {
  firstName: string;
  lastName: string;
  pesel: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly router: Router) {}

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  loginMock(email: string, password: string): boolean {
    if (!email || !password) {
      return false;
    }

    // Tymczasowy token testowy do sprawdzenia działania frontendu.
    // Później zastąpimy to żądaniem POST /api/v1/auth/login.
    this.setAccessToken('mock-supermed-access-token');

    return true;
  }

  registerPatientMock(payload: PatientRegisterMockPayload): boolean {
    if (
      !payload.firstName ||
      !payload.lastName ||
      !payload.pesel ||
      !payload.email ||
      !payload.password
    ) {
      return false;
    }

    // Tymczasowa rejestracja pacjenta.
    // Docelowo wyślemy dane do POST /api/v1/patient-portal/register.
    // Konto pacjenta po rejestracji będzie miało isAuthorized = false.
    return true;
  }

  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    this.router.navigate(['/login']);
  }
}