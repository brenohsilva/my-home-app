import { routes } from './app.routes';
import { authGuard } from './core/auth/guards/auth.guard';

describe('application routes', () => {
  it('provides login, register and home routes', () => {
    expect(routes.map((route) => route.path)).toEqual(
      expect.arrayContaining(['login', 'register', 'home']),
    );
  });

  it('protects the home route with the authentication guard', () => {
    const home = routes.find((route) => route.path === 'home');
    expect(home?.canActivate).toContain(authGuard);
  });
});
