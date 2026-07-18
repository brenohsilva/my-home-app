import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../services/auth.service';

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const isApiRequest = request.url.startsWith(environment.apiUrl);
  const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some((path) => request.url.endsWith(path));

  if (!isApiRequest || isPublicAuthRequest) {
    return next(request);
  }

  return from(auth.getAccessToken()).pipe(
    switchMap((accessToken) => {
      const authenticatedRequest = accessToken
        ? request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
        : request;

      return next(authenticatedRequest).pipe(
        catchError((error: unknown) => {
          if (!(error instanceof HttpErrorResponse) || error.status !== 401 || !accessToken) {
            return throwError(() => error);
          }

          return auth.refreshSession().pipe(
            switchMap((newAccessToken) =>
              next(
                request.clone({
                  setHeaders: { Authorization: `Bearer ${newAccessToken}` },
                }),
              ),
            ),
            catchError((refreshError: unknown) =>
              auth.logout().pipe(
                switchMap(() =>
                  from(router.navigate(['/login'], { queryParams: { sessionExpired: true } })),
                ),
                switchMap(() => throwError(() => refreshError)),
              ),
            ),
          );
        }),
      );
    }),
  );
};
