import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessDeniedComponent } from '../features/access-denied/access-denied.component';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { RoleGuard } from '../guards/role-guard.guard';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    AccessDeniedComponent

  ],
  providers: [
    // ... other providers
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    JwtHelperService,
    RoleGuard
  ],
  imports: [
    CommonModule,
    TranslateModule.forChild()
  ]

})
export class SharedModule { }
