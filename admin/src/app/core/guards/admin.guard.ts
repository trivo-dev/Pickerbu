import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Chỉ người dùng có user_type ADMIN. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }
  if (auth.user()?.userType === 'ADMIN') {
    return true;
  }
  return router.createUrlTree(['/']);
};
