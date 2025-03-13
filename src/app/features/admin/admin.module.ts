import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AdminLayoutComponent } from '../../core/layout/admin-layout/admin-layout.component';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { NavbarComponent } from '../../core/layout/navbar/navbar.component';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { ClientsComponent } from './clients/clients.component';
import { PaymentsExpensesComponent } from './payments-expenses/payments-expenses.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { VehiclesListComponent } from './vehicles/vehicles-list/vehicles-list.component';
import { VehicleDetailsComponent } from './vehicles/vehicle-details/vehicle-details.component';
import { VehicleCreateComponent } from './vehicles/vehicle-create/vehicle-create.component';

@NgModule({
    imports: [
        CommonModule,
        AdminRoutingModule,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatToolbarModule,
        MatButtonModule,
        AdminLayoutComponent,
        SidebarComponent,
        NavbarComponent,
        DashboardComponent,
        ReservationsComponent,
        ClientsComponent,
        PaymentsExpensesComponent,
        UserManagementComponent,
        VehiclesListComponent,
        VehicleDetailsComponent,
        VehicleCreateComponent,
    ]
})
export class AdminModule { }
