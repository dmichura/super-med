import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  registerForm = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    pesel: [
      '',
      [
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
        Validators.pattern(/^\d{11}$/),
      ],
    ],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  submit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formValue = this.registerForm.getRawValue();

    if (formValue.password !== formValue.confirmPassword) {
      this.errorMessage = 'Hasła muszą być takie same.';
      return;
    }

    this.isSubmitting = true;

    const isRegistered = this.authService.registerPatientMock({
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      pesel: formValue.pesel,
      email: formValue.email,
      password: formValue.password,
    });

    this.isSubmitting = false;

    if (!isRegistered) {
      this.errorMessage = 'Nie udało się utworzyć konta pacjenta.';
      return;
    }

    this.successMessage =
      'Konto pacjenta zostało utworzone. Dostęp do dokumentacji zostanie odblokowany po osobistej weryfikacji w placówce.';

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2500);
  }
}