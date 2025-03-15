import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehiclesListComponent } from './vehicles-list/vehicles-list.component';
import { VehicleCreateComponent } from './vehicle-create/vehicle-create.component';
import { VehicleDetailsComponent } from './vehicle-details/vehicle-details.component';

const routes: Routes = [
  { path: '', component: VehiclesListComponent },
  { path: 'vehicles/create', component: VehicleCreateComponent },
  { path: 'vehicles/:id', component: VehicleDetailsComponent },
  {path : 'vehicles/:id/edit', component: VehicleCreateComponent},
  {path : 'vehicles/:id/details', component: VehicleDetailsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiclesRoutingModule { }
