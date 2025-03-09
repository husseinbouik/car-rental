import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { ClientsComponent } from './clients/clients.component';
import { PaymentsExpensesComponent } from './payments-expenses/payments-expenses.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { VehiclesComponent } from './vehicles/vehicles.component'; // Import the standalone component
import { AdminRoutingModule } from '../app.routes';

@NgModule({
    declarations: [

    ],
    imports: [
        CommonModule,
        AdminRoutingModule,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatToolbarModule,
        MatButtonModule,
        VehiclesComponent,
        AdminLayoutComponent,
        DashboardComponent,
        ReservationsComponent,
        ClientsComponent,
        PaymentsExpensesComponent,
        UserManagementComponent,
        SidebarComponent,
        HeaderComponent
    ]
})
export class AdminModule { }
