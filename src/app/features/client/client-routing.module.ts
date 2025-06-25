import { ClientModule } from './client.module';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ResetPasswordRequestComponent } from './reset-password-request/reset-password-request.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { AccessDeniedComponent } from '../access-denied/access-denied.component';
import { LandingComponent } from './landing/landing.component';
import { MyReservationsComponent } from './my-reservations/my-reservations.component';
import { VehicleBrowserComponent } from './vehicle-browser/vehicle-browser.component';
import { ClientLayoutComponent } from '../../core/layout/client-layout/client-layout.component';
import { ProfilInfoComponent } from './profil-info/profil-info.component';
import { PaymentComponent } from './payment/payment.component';
import { PaymentSuccessComponent } from './payment/payment-success.component';
import { RoleGuard } from '../../guards/role-guard.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent},
  { path:'signup', component: SignupComponent},
  {
    path: '',
    component: LandingComponent
  },
  // Client dashboard route - redirect to landing for now since no dashboard component exists
  {
    path: 'client-dashboard',
    component: LandingComponent,
    title: 'Dashboard',
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_CLIENT', 'ROLE_USER'] }
  },
  {
    path: 'vehicles',
    component: VehicleBrowserComponent,
    title: 'Browse Vehicles',
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_CLIENT', 'ROLE_USER'] }
  },
  {
    path: 'vehicle-browser',
    redirectTo: 'vehicles',
    pathMatch: 'full'
  },
  {
    path: 'my-reservations',
    component: MyReservationsComponent,
    title: 'My Reservations',
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_CLIENT', 'ROLE_USER'] }
  },
  {
    path: 'profile',
    component: ProfilInfoComponent,
    title: 'Profile',
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_CLIENT', 'ROLE_USER'] }
  },
  {
    path: 'profil-info',
    redirectTo: 'profile',
    pathMatch: 'full'
  },

  { path: 'reset-password-request', component: ResetPasswordRequestComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  {
    path: 'payment',
    component: PaymentComponent
  },
  {
    path: 'payment-success',
    component: PaymentSuccessComponent
  },

  // { path: 'vehicles', loadChildren: () => import('./vehicles/vehicles.module').then(m => m.VehiclesModule) },
  // { path: 'reservations', loadChildren: () => import('./reservations/reservations.module').then(m => m.ReservationsModule) },
  // { path: 'user-management', loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule) },
  // { path: 'payments-expenses', loadChildren: () => import('./payments-expenses/payments-expenses.module').then(m => m.PaymentsExpensesModule) },
  // { path: 'clients', loadChildren: () => import('./clients/clients.module').then(m => m.ClientsModule) },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {}
