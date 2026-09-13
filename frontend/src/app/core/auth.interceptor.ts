import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Functional interceptor (Angular 15+ style, no class/NgModule needed).
 * Reads the JWT from AuthService and attaches it to every outgoing
 * request as an Authorization header, so individual components/services
 * never have to think about auth headers.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
