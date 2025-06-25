import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppRoutingModule } from './app.routes';
import { registerables } from 'chart.js';
import { Chart } from 'chart.js';

// Register Chart.js components globally
Chart.register(...registerables);

@NgModule({
  declarations: [

  ],
  imports: [
     CommonModule,
       AppRoutingModule,
       MatSidenavModule,
       MatListModule,
       MatIconModule,
       MatToolbarModule,
       MatButtonModule,
       FormsModule,
       FontAwesomeModule,
       HttpClientModule,
       FormsModule
  ]
})
export class AppModule { }
