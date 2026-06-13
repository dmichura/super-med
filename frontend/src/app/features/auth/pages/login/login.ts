import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isSubmitting = false;
  errorMessage = '';

  loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async submit(): Promise<void> {
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const { email, password } = this.loginForm.getRawValue();

    try {
      const response = await firstValueFrom(
        this.authService.login({
          email,
          password,
        }),
      );

      if (response.user.role === 'PATIENT') {
        await this.router.navigate(['/patient-portal']);
        return;
      }

      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage = this.getLoginErrorMessage(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private getLoginErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Wystąpił nieoczekiwany błąd podczas logowania.';
    }

    if (error.status === 0) {
      return 'Brak połączenia z backendem. Sprawdź, czy backend działa na porcie 3000.';
    }

    const backendMessage = error.error?.message;

    if (Array.isArray(backendMessage)) {
      return backendMessage.join(' ');
    }

    if (typeof backendMessage === 'string') {
      return backendMessage;
    }

    if (error.status === 401) {
      return 'Nieprawidłowy email lub hasło.';
    }

    if (error.status === 400) {
      return 'Nieprawidłowe dane logowania.';
    }

    if (error.status === 500) {
      return 'Błąd serwera. Sprawdź terminal backendu.';
    }

    return 'Nie udało się zalogować. Spróbuj ponownie.';
  }
}