import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { VehiclesRoutingModule } from './vehicles-routing.module';
import { VehiclesListComponent } from './vehicles-list/vehicles-list.component';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { VehicleCreateComponent } from './vehicle-create/vehicle-create.component';
import { VehicleDetailsComponent } from './vehicle-details/vehicle-details.component';



@NgModule({
  declarations: [
    VehiclesListComponent,
    VehicleCreateComponent,
    VehicleDetailsComponent

  ],
  imports: [
    CommonModule,
    VehiclesRoutingModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    FormsModule,
    TranslateModule.forChild(),
  ]
})
export class VehiclesModule { }
