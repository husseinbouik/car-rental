import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehiclesRoutingModule } from './vehicles-routing.module';
import { VehiclesListComponent } from './vehicles-list/vehicles-list.component';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    VehiclesListComponent,

  ],
  imports: [
    CommonModule,
    VehiclesRoutingModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    FormsModule,
  ]
})
export class VehiclesModule { }
