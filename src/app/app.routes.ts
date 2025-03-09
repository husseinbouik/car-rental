import { NgModule } from '@angular/core';
    import { RouterModule, Routes } from '@angular/router';
    import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
    import { DashboardComponent } from './admin/dashboard/dashboard.component';
    import { VehiclesComponent } from './admin/vehicles/vehicles.component';
    import { ReservationsComponent } from './admin/reservations/reservations.component';
    import { ClientsComponent } from './admin/clients/clients.component';
    import { PaymentsExpensesComponent } from './admin/payments-expenses/payments-expenses.component';
    import { UserManagementComponent } from './admin/user-management/user-management.component';

 export   const routes: Routes = [
      {
        path: '',
        component: AdminLayoutComponent,
        children: [
          { path: 'dashboard', component: DashboardComponent },
          { path: 'vehicles', component: VehiclesComponent },
          { path: 'reservations', component: ReservationsComponent },
          { path: 'clients', component: ClientsComponent },
          { path: 'payments', component: PaymentsExpensesComponent },
          { path: 'user-management', component: UserManagementComponent },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      }
    ];

    @NgModule({
      imports: [RouterModule.forChild(routes)],
      exports: [RouterModule]
    })
    export class AdminRoutingModule { }
