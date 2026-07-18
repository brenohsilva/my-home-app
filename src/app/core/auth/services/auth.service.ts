import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import {
  Observable,
  catchError,
  finalize,
  from,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
  timeout,
} from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
} from '../models/auth.models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly authUrl = `${environment.apiUrl}/auth`;
  private refreshRequest$: Observable<string> | null = null;

  readonly currentUser = signal<AuthUser | null>(null);

  login(request: LoginRequest): Observable<AuthUser> {
    return this.authenticate('login', request);
  }

  register(request: RegisterRequest): Observable<AuthUser> {
    return this.authenticate('register', request);
  }

  refreshSession(): Observable<string> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    this.refreshRequest$ = from(this.tokenStorage.getRefreshToken()).pipe(
      switchMap((refreshToken) => {
        if (!refreshToken) {
          return throwError(() => new Error('Refresh token unavailable'));
        }
        const request: RefreshRequest = { refreshToken };
        return this.http
          .post<AuthResponse>(`${this.authUrl}/refresh`, request)
          .pipe(timeout(environment.requestTimeoutMs));
      }),
      switchMap((response) =>
        from(this.tokenStorage.saveTokens(response.accessToken, response.refreshToken)).pipe(
          tap(() => this.currentUser.set(response.user)),
          map(() => response.accessToken),
        ),
      ),
      finalize(() => (this.refreshRequest$ = null)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.refreshRequest$;
  }

  getAccessToken(): Promise<string | null> {
    return this.tokenStorage.getAccessToken();
  }

  isAuthenticated(): Observable<boolean> {
    return from(this.tokenStorage.getAccessToken()).pipe(map(Boolean));
  }

  loadCurrentUser(): Observable<AuthUser | null> {
    return from(this.tokenStorage.getAccessToken()).pipe(
      switchMap((token) => {
        if (!token) return of(null);
        return this.http
          .get<AuthUser>(`${this.authUrl}/me`)
          .pipe(timeout(environment.requestTimeoutMs));
      }),
      tap((user) => this.currentUser.set(user)),
      catchError(() => of(null)),
    );
  }

  logout(): Observable<void> {
    return from(this.tokenStorage.clear()).pipe(
      tap(() => this.currentUser.set(null)),
      map(() => undefined),
    );
  }

  friendlyError(error: unknown, action: 'login' | 'register'): string {
    if (!(error instanceof HttpErrorResponse)) {
      return error instanceof Error && error.name === 'TimeoutError'
        ? 'O servidor demorou para responder. Tente novamente.'
        : 'Não foi possível conectar ao servidor. Verifique sua internet.';
    }

    if (error.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique sua internet.';
    }
    if (action === 'login' && error.status === 401) {
      return 'Não foi possível entrar. Verifique seu email e senha.';
    }
    if (action === 'register' && error.status === 409) {
      return 'Este email já está cadastrado. Acesse sua conta para continuar.';
    }
    if (error.status >= 500) {
      return 'O serviço está indisponível no momento. Tente novamente em instantes.';
    }
    return action === 'login'
      ? 'Não foi possível entrar. Revise os dados e tente novamente.'
      : 'Não foi possível criar sua conta. Revise os dados e tente novamente.';
  }

  private authenticate(
    endpoint: 'login' | 'register',
    request: LoginRequest | RegisterRequest,
  ): Observable<AuthUser> {
    return this.http.post<AuthResponse>(`${this.authUrl}/${endpoint}`, request).pipe(
      timeout(environment.requestTimeoutMs),
      switchMap((response) =>
        from(this.tokenStorage.saveTokens(response.accessToken, response.refreshToken)).pipe(
          tap(() => this.currentUser.set(response.user)),
          map(() => response.user),
        ),
      ),
    );
  }
}
