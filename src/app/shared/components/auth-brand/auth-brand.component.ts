import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-auth-brand',
  imports: [IonIcon],
  template: `
    <header class="brand" aria-label="Minha Morada">
      <div class="brand__icon" aria-hidden="true">
        <ion-icon name="home-outline"></ion-icon>
      </div>
      <h1>Minha Morada</h1>
      <p>Com você desde o início</p>
    </header>
  `,
  styleUrl: './auth-brand.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthBrandComponent {}
