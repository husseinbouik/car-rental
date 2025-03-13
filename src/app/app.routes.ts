import { NgModule } from '@angular/core';
    import { RouterModule, Routes } from '@angular/router';
    import { AdminLayoutComponent } from './core/layout/admin-layout/admin-layout.component';
    import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
    import { VehiclesComponent } from './features/admin/vehicles/vehicles.component';
    import { ReservationsComponent } from './features/admin/reservations/reservations.component';
    import { ClientsComponent } from './features/admin/clients/clients.component';
    import { PaymentsExpensesComponent } from './features/admin/payments-expenses/payments-expenses.component';
    import { UserManagementComponent } from './features/admin/user-management/user-management.component';
    import { LoginComponent } from './features/admin/login/login.component';

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
          { path: 'login', component: LoginComponent },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      }
    ];

    @NgModule({
      imports: [RouterModule.forChild(routes)],
      exports: [RouterModule]
    })
    export class AdminRoutingModule { }
