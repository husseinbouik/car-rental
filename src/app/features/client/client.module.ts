import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientRoutingModule } from './client-routing.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { ResetPasswordRequestComponent } from './reset-password-request/reset-password-request.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { LandingComponent } from './landing/landing.component';
import { VehicleBrowserComponent } from './vehicle-browser/vehicle-browser.component';
import { ProfilInfoComponent } from './profil-info/profil-info.component';
import { MyReservationsComponent } from './my-reservations/my-reservations.component';
import { PaymentComponent } from './payment/payment.component';
import { PaymentSuccessComponent } from './payment/payment-success.component';

@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
    ResetPasswordRequestComponent,
    ResetPasswordComponent,
    VerifyEmailComponent,
    LandingComponent,
    VehicleBrowserComponent
  ],
  imports: [
    CommonModule,
    ClientRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    FontAwesomeModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    // Standalone components
    ProfilInfoComponent,
    MyReservationsComponent,
    PaymentComponent,
    PaymentSuccessComponent
  ],
})
export class ClientModule { }
