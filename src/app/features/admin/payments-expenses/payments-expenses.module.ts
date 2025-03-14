import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentsExpensesRoutingModule } from './payments-expenses-routing.module';
import { PaymentsExpensesComponent } from './payments-expenses.component';


@NgModule({
  declarations: [
    PaymentsExpensesComponent
  ],
  imports: [
    CommonModule,
    PaymentsExpensesRoutingModule
  ]
})
export class PaymentsExpensesModule { }
