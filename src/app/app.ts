import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
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

@Component({
  selector: 'app-root',
  imports: [IonApp, IonRouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
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
