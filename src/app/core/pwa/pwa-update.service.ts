import { ApplicationRef, Injectable, inject, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { Capacitor } from '@capacitor/core';
import { concat, filter, first, interval } from 'rxjs';

const UPDATE_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private readonly applicationRef = inject(ApplicationRef);
  private readonly swUpdate = inject(SwUpdate);

  readonly updateAvailable = signal(false);

  constructor() {
    if (Capacitor.isNativePlatform() || !this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe(() => this.updateAvailable.set(true));

    const applicationStable = this.applicationRef.isStable.pipe(first((stable) => stable));
    concat(applicationStable, interval(UPDATE_CHECK_INTERVAL_MS)).subscribe(() => {
      void this.swUpdate.checkForUpdate().catch(() => undefined);
    });
  }

  dismissUpdate(): void {
    this.updateAvailable.set(false);
  }

  async activateUpdate(): Promise<void> {
    if (Capacitor.isNativePlatform() || !this.swUpdate.isEnabled) {
      return;
    }

    await this.swUpdate.activateUpdate();
    window.location.reload();
  }
}
