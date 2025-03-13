import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehiclesListComponent } from './vehicles/vehicles-list/vehicles-list.component';
import { VehicleDetailsComponent } from './vehicles/vehicle-details/vehicle-details.component';
import { VehicleCreateComponent } from './vehicles/vehicle-create/vehicle-create.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { ClientsComponent } from './clients/clients.component';
import { PaymentsExpensesComponent } from './payments-expenses/payments-expenses.component';
import { UserManagementComponent } from './user-management/user-management.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'reservations', component: ReservationsComponent },
  { path: 'clients', component: ClientsComponent },
  { path: 'payments', component: PaymentsExpensesComponent },
  { path: 'user-management', component: UserManagementComponent },

  { path: 'vehicles', component: VehiclesListComponent },
  { path: 'vehicles/create', component: VehicleCreateComponent },
  { path: 'vehicles/:id', component: VehicleDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
