import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/courts-home.component').then((m) => m.CourtsHomeComponent),
  },
];
