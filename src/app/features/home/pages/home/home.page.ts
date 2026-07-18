import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-home-page',
  imports: [IonButton, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.auth.currentUser;
  readonly loading = signal(false);

  constructor() {
    if (!this.user()) {
      this.auth.loadCurrentUser().subscribe();
    }
  }

  logout(): void {
    this.loading.set(true);
    this.auth
      .logout()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => void this.router.navigateByUrl('/login', { replaceUrl: true }));
  }
}
