import { Component, inject } from '@angular/core';
import type { ToastButton } from '@ionic/core';
import { IonApp, IonRouterOutlet, IonToast } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  eyeOffOutline,
  eyeOutline,
  homeOutline,
  informationCircleOutline,
  lockClosedOutline,
  logInOutline,
  logOutOutline,
  mailOutline,
  personAddOutline,
  personOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { PwaInstallService } from './core/pwa/pwa-install.service';
import { PwaUpdateService } from './core/pwa/pwa-update.service';

@Component({
  selector: 'app-root',
  imports: [IonApp, IonRouterOutlet, IonToast],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly pwaInstall = inject(PwaInstallService);
  readonly pwaUpdate = inject(PwaUpdateService);
  readonly updateToastButtons: ToastButton[] = [
    {
      text: 'Depois',
      role: 'cancel',
      handler: () => this.pwaUpdate.dismissUpdate(),
    },
    {
      text: 'Atualizar',
      handler: () => void this.pwaUpdate.activateUpdate(),
    },
  ];

  constructor() {
    addIcons({
      arrowBackOutline,
      eyeOffOutline,
      eyeOutline,
      homeOutline,
      informationCircleOutline,
      lockClosedOutline,
      logInOutline,
      logOutOutline,
      mailOutline,
      personAddOutline,
      personOutline,
      shieldCheckmarkOutline,
    });
  }
}
