import { Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';

type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable';

interface BeforeInstallPromptEvent extends Event {
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  readonly canInstall = signal(false);
  readonly isInstalled = signal(this.detectStandaloneMode());

  constructor() {
    if (Capacitor.isNativePlatform() || typeof window === 'undefined') {
      return;
    }

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      this.canInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canInstall.set(false);
      this.isInstalled.set(true);
    });
  }

  async promptInstall(): Promise<InstallOutcome> {
    if (!this.deferredPrompt || Capacitor.isNativePlatform()) {
      return 'unavailable';
    }

    const prompt = this.deferredPrompt;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    this.deferredPrompt = null;
    this.canInstall.set(false);
    return outcome;
  }

  private detectStandaloneMode(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && window.navigator.standalone === true)
    );
  }
}

declare global {
  interface Navigator {
    readonly standalone?: boolean;
  }
}
