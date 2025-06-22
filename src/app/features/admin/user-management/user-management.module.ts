import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserManagementListComponent } from './user-management-list/user-management-list.component';


@NgModule({
  declarations: [
    UserManagementListComponent
  ],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    TranslateModule.forChild()
  ]
})
export class UserManagementModule { }
