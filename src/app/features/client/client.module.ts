import { HttpClientModule } from '@angular/common/http';
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
import { RouterModule } from '@angular/router';

import { ReactiveFormsModule } from '@angular/forms';
import { ResetPasswordRequestComponent } from './reset-password-request/reset-password-request.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { LandingComponent } from './landing/landing.component';


@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
    ResetPasswordRequestComponent,
    ResetPasswordComponent,
    VerifyEmailComponent,
    LandingComponent
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
    FontAwesomeModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
})
export class ClientModule { }
