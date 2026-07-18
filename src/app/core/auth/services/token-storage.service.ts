import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const ACCESS_TOKEN_KEY = 'minha_morada_access_token';
const REFRESH_TOKEN_KEY = 'minha_morada_refresh_token';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  async getAccessToken(): Promise<string | null> {
    return (await Preferences.get({ key: ACCESS_TOKEN_KEY })).value;
  }

  async getRefreshToken(): Promise<string | null> {
    return (await Preferences.get({ key: REFRESH_TOKEN_KEY })).value;
  }

  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      Preferences.set({ key: ACCESS_TOKEN_KEY, value: accessToken }),
      Preferences.set({ key: REFRESH_TOKEN_KEY, value: refreshToken }),
    ]);
  }

  async clear(): Promise<void> {
    await Promise.all([
      Preferences.remove({ key: ACCESS_TOKEN_KEY }),
      Preferences.remove({ key: REFRESH_TOKEN_KEY }),
    ]);
  }
}
