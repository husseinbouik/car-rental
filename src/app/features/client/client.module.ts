import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientRoutingModule } from './client-routing.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AdminLayoutComponent } from '../../core/layout/admin-layout/admin-layout.component';
import { NavbarComponent } from '../../core/layout/navbar/navbar.component';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar.component';
import { AdminRoutingModule } from '../admin/admin-routing.module';



@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent
  ],
  imports: [
    CommonModule,
    ClientRoutingModule,
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
    FontAwesomeModule
  ]
})
export class ClientModule { }
