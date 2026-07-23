import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-home-page',
  imports: [IonContent, IonIcon],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly auth = inject(AuthService);

  readonly user = this.auth.currentUser;
  readonly greeting = computed(() => {
    const firstName = this.user()?.name.trim().split(/\s+/)[0];
    return firstName ? `Olá, ${firstName}` : 'Olá';
  });

  constructor() {
    if (!this.user()) {
      this.auth.loadCurrentUser().subscribe();
    }
  }
}
