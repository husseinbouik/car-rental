import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservationsListComponent } from './reservations-list/reservations-list.component';
import { ReservationCreateComponent } from './reservation-create/reservation-create.component';
import { ReservationDetailsComponent } from './reservation-details/reservation-details.component';

const routes: Routes = [
  { path: '', component: ReservationsListComponent },
  { path: 'reservations/create', component: ReservationCreateComponent },
  { path: 'reservations/:id', component: ReservationDetailsComponent },
  {path : 'reservations/:id/edit', component: ReservationCreateComponent},
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservationsRoutingModule { }
