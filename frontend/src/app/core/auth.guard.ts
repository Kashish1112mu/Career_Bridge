import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Blocks a route unless the user is logged in. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/login']);
  return false;
};

/** Blocks a route unless the logged-in user is a recruiter. */
export const recruiterGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.isRecruiter()) return true;

  router.navigate(['/jobs']);
  return false;
};

/** Blocks a route unless the logged-in user is a student. */
export const studentGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.isStudent()) return true;

  router.navigate(['/jobs']);
  return false;
};
