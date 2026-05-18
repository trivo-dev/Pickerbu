import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./features/account/account.component').then((m) => m.AccountComponent),
    canActivate: [authGuard],
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./features/users/user-list.component').then((m) => m.UserListComponent),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/courts/court-list.component').then((m) => m.CourtListComponent),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'schedule',
    loadComponent: () =>
      import('./features/schedule/court-schedule.component').then((m) => m.CourtScheduleComponent),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./features/analytics/analytics.component').then((m) => m.AnalyticsComponent),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'orders/new',
    loadComponent: () =>
      import('./features/orders/order-create.component').then((m) => m.OrderCreateComponent),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'orders/:id',
    loadComponent: () =>
      import('./features/orders/order-detail.component').then((m) => m.OrderDetailComponent),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./features/orders/order-list.component').then((m) => m.OrderListComponent),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./features/notifications/notifications-page.component').then(
        (m) => m.NotificationsPageComponent,
      ),
    canActivate: [authGuard, adminGuard],
  },
  { path: '**', redirectTo: '' },
];
