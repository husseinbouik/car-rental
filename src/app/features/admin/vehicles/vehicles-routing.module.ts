// src/app/admin/vehicles/vehicles-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../../guards/role-guard.guard';
import { VehiclesListComponent } from './vehicles-list/vehicles-list.component';
import { VehicleCreateComponent } from './vehicle-create/vehicle-create.component';
import { VehicleDetailsComponent } from './vehicle-details/vehicle-details.component';

const routes: Routes = [
  {
    path: '',
    component: VehiclesListComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'create',
    component: VehicleCreateComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: ':id',
    component: VehicleDetailsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'edit/:id',
    component: VehicleCreateComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'details/:id',
    component: VehicleDetailsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiclesRoutingModule { }
