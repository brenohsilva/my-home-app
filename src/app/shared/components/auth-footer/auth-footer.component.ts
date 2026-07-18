import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-auth-footer',
  imports: [IonIcon, RouterLink],
  template: `
    <nav class="auth-links" aria-label="Ações secundárias">
      <a class="auth-link" [routerLink]="primaryLink()">
        <ion-icon [name]="primaryIcon()" aria-hidden="true"></ion-icon>
        <span>{{ primaryLabel() }}</span>
      </a>
      <button class="auth-link" type="button" aria-label="Quem somos, em breve">
        <ion-icon name="information-circle-outline" aria-hidden="true"></ion-icon>
        <span>Quem somos</span>
        <small>Em breve</small>
      </button>
    </nav>
  `,
  styleUrl: './auth-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthFooterComponent {
  readonly primaryLabel = input.required<string>();
  readonly primaryLink = input.required<string>();
  readonly primaryIcon = input.required<string>();
}
