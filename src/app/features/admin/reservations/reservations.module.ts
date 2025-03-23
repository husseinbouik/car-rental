import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReservationsRoutingModule } from './reservations-routing.module';
import { ReservationListComponent } from './reservations-list/reservations-list.component';
import { FormsModule } from '@angular/forms';
import { ReservationDetailsComponent } from './reservation-details/reservation-details.component';
import { ReservationCreateComponent } from './reservation-create/reservation-create.component';


@NgModule({
  declarations: [
    ReservationListComponent,
    ReservationDetailsComponent,
    ReservationCreateComponent
  ],
  imports: [
    CommonModule,
    ReservationsRoutingModule,
    FormsModule,
  ]
})
export class ReservationsModule { }
