import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientsListComponent } from './clients-list/clients-list.component';
import { ClientCreateComponent } from './client-create/client-create.component';
import { ClientDetailsComponent } from './client-details/client-details.component';

const routes: Routes = [
  { path: '', component: ClientsListComponent },
  { path: 'reservations/create', component: ClientCreateComponent },
  { path: 'reservations/:id', component: ClientDetailsComponent },
  {path : 'reservations/:id/edit', component: ClientCreateComponent},
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule { }
