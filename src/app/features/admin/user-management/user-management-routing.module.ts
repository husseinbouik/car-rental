import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserManagementListComponent } from './user-management-list/user-management-list.component';
import { UserManagementDetailsComponent } from './user-management-details/user-management-details.component';
import { UserManagementCreateComponent } from './user-management-create/user-management-create.component';


const routes: Routes = [
  { path: '', component: UserManagementListComponent },
  { path: 'user-management/create', component: UserManagementCreateComponent },
  { path: 'user-management/:id', component: UserManagementDetailsComponent },
  {path : 'user-management/:id/edit', component: UserManagementCreateComponent},
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }

