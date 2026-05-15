import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'clients',
    loadComponent: () => import('./features/clients/clients-list/clients-list.component').then(m => m.ClientsListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'clients/create',
    loadComponent: () => import('./features/clients/client-create/client-create.component').then(m => m.ClientCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'clients/:id',
    loadComponent: () => import('./features/clients/client-detail/client-detail.component').then(m => m.ClientDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dossiers',
    loadComponent: () => import('./features/dossiers/dossiers-list/dossiers-list.component').then(m => m.DossiersListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dossiers/create',
    loadComponent: () => import('./features/dossiers/dossier-create/dossier-create.component').then(m => m.DossierCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dossiers/:id',
    loadComponent: () => import('./features/dossiers/dossier-detail/dossier-detail.component').then(m => m.DossierDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'calendar',
    loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent),
    canActivate: [authGuard]
  },
  {
    path: 'documents',
    loadComponent: () => import('./features/documents/documents.component').then(m => m.DocumentsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];