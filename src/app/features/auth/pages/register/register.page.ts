import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput, IonSpinner } from '@ionic/angular/standalone';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { AuthBrandComponent } from '../../../../shared/components/auth-brand/auth-brand.component';
import { AuthFooterComponent } from '../../../../shared/components/auth-footer/auth-footer.component';

function matchingPasswords(control: AbstractControl): ValidationErrors | null {
  return control.get('password')?.value === control.get('confirmPassword')?.value
    ? null
    : { passwordMismatch: true };
}

@Component({
  selector: 'app-register-page',
  imports: [
    AuthBrandComponent,
    AuthFooterComponent,
    IonButton,
    IonContent,
    IonIcon,
    IonInput,
    IonSpinner,
    ReactiveFormsModule,
  ],
  templateUrl: './register.page.html',
  styleUrl: '../auth.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly passwordVisible = signal(false);
  readonly confirmPasswordVisible = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.formBuilder.nonNullable.group(
    {
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: matchingPasswords },
  );

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.form.getRawValue();
    this.errorMessage.set('');
    this.loading.set(true);
    this.auth
      .register({ name: name.trim(), email, password })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl('/home', { replaceUrl: true }),
        error: (error: unknown) =>
          this.errorMessage.set(this.auth.friendlyError(error, 'register')),
      });
  }

  showError(
    controlName: 'name' | 'email' | 'password' | 'confirmPassword',
    error: string,
  ): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(error);
  }

  passwordsMismatch(): boolean {
    return this.form.controls.confirmPassword.touched && this.form.hasError('passwordMismatch');
  }

  togglePassword(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.passwordVisible.update((visible) => !visible);
    } else {
      this.confirmPasswordVisible.update((visible) => !visible);
    }
  }
}
