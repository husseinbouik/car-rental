import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientListComponent } from './clients-list/clients-list.component';
import { ClientCreateComponent } from './client-create/client-create.component';
import { ClientDetailsComponent } from './client-details/client-details.component';

const routes: Routes = [
  { path: '', component: ClientListComponent },
  { path: 'create', component: ClientCreateComponent },
  { path: 'details/:id', component: ClientDetailsComponent },
  {path : 'edit/:id', component: ClientCreateComponent},
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule { }
