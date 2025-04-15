// src/app/admin/admin-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../guards/role-guard.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'vehicles',
    loadChildren: () => import('./vehicles/vehicles.module').then(m => m.VehiclesModule),
    canActivate: [RoleGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'reservations',
    loadChildren: () => import('./reservations/reservations.module').then(m => m.ReservationsModule),
    canActivate: [RoleGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'user-management',
    loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule),
    canActivate: [RoleGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'payments-expenses',
    loadChildren: () => import('./payments-expenses/payments-expenses.module').then(m => m.PaymentsExpensesModule),
    canActivate: [RoleGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'clients',
    loadChildren: () => import('./clients/clients.module').then(m => m.ClientsModule),
    canActivate: [RoleGuard],
    canActivateChild: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
