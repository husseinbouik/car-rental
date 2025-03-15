import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReservationsRoutingModule } from './reservations-routing.module';
import { ReservationsListComponent } from './reservations-list/reservations-list.component';


@NgModule({
  declarations: [
    ReservationsListComponent
  ],
  imports: [
    CommonModule,
    ReservationsRoutingModule
  ]
})
export class ReservationsModule { }
