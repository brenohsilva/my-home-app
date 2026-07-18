import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonInput, IonSpinner } from '@ionic/angular/standalone';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { AuthBrandComponent } from '../../../../shared/components/auth-brand/auth-brand.component';
import { AuthFooterComponent } from '../../../../shared/components/auth-footer/auth-footer.component';

@Component({
  selector: 'app-login-page',
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
  templateUrl: './login.page.html',
  styleUrl: '../auth.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly passwordVisible = signal(false);
  readonly errorMessage = signal(
    this.route.snapshot.queryParamMap.has('sessionExpired')
      ? 'Sua sessão expirou. Entre novamente para continuar.'
      : '',
  );

  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.maxLength(72)]],
  });

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.loading.set(true);
    this.auth
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl('/home', { replaceUrl: true }),
        error: (error: unknown) => this.errorMessage.set(this.auth.friendlyError(error, 'login')),
      });
  }

  showError(controlName: 'email' | 'password', error: string): boolean {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(error);
  }

  togglePassword(): void {
    this.passwordVisible.update((visible) => !visible);
  }
}
