import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservationListComponent } from './reservations-list/reservations-list.component';
import { ReservationCreateComponent } from './reservation-create/reservation-create.component';
import { ReservationDetailsComponent } from './reservation-details/reservation-details.component';

const routes: Routes = [
  { path: '', component: ReservationListComponent },
  { path: 'create', component: ReservationCreateComponent },
  { path: 'details/:id', component: ReservationDetailsComponent },
  {path : 'edit/:id', component: ReservationCreateComponent},
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservationsRoutingModule { }
