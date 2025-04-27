// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './core/layout/admin-layout/admin-layout.component';
import { ClientLayoutComponent } from './core/layout/client-layout/client-layout.component';
import { AccessDeniedComponent } from './features/access-denied/access-denied.component';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/login/login.component';

export const routes: Routes = [
  // Admin Routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
      },
    ],
  },

  {
    path: 'client', // * added or the `*path:'', component` value
    component: ClientLayoutComponent,
    children: [
      {
        path: '',  // Make sure this is present
        loadChildren: () => import('./features/client/client.module').then(m => m.ClientModule),
      },
    ],
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent
  },
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  { path: '**', redirectTo: 'access-denied' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
