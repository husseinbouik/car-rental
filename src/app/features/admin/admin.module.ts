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
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BaseChartDirective } from 'ng2-charts';

@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    FormsModule,
    AdminLayoutComponent,
    SidebarComponent,
    NavbarComponent,
    FontAwesomeModule,
    BaseChartDirective
  ]
})
export class AdminModule { }
