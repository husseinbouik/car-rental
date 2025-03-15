import { ClientModule } from './../client/client.module';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehiclesListComponent } from './vehicles/vehicles-list/vehicles-list.component';
import { VehicleDetailsComponent } from './vehicles/vehicle-details/vehicle-details.component';
import { VehicleCreateComponent } from './vehicles/vehicle-create/vehicle-create.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'login', component: LoginComponent},







  { path: 'vehicles', loadChildren: () => import('./vehicles/vehicles.module').then(m => m.VehiclesModule) },
  { path: 'reservations', loadChildren: () => import('./reservations/reservations.module').then(m => m.ReservationsModule) },
  { path: 'user-management', loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule) },
  { path: 'payments-expenses', loadChildren: () => import('./payments-expenses/payments-expenses.module').then(m => m.PaymentsExpensesModule) },
  { path: 'clients', loadChildren: () => import('./clients/clients.module').then(m => m.ClientsModule) },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
