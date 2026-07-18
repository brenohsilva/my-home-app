import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(AuthService);
  });

  it('maps invalid credentials to a friendly message', () => {
    const error = new HttpErrorResponse({ status: 401 });
    expect(service.friendlyError(error, 'login')).toContain('email e senha');
  });

  it('maps duplicate email to a friendly message', () => {
    const error = new HttpErrorResponse({ status: 409 });
    expect(service.friendlyError(error, 'register')).toContain('já está cadastrado');
  });

  it('does not expose HTTP details for server errors', () => {
    const error = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
    const message = service.friendlyError(error, 'login');
    expect(message).not.toContain('500');
    expect(message).not.toContain('Internal Server Error');
  });
});
