import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentsExpensesRoutingModule } from './payments-expenses-routing.module';
import { PaymentsExpensesListComponent } from './payments-expenses-list/payments-expenses-list.component';


@NgModule({
  declarations: [
    PaymentsExpensesListComponent
  ],
  imports: [
    CommonModule,
    PaymentsExpensesRoutingModule
  ]
})
export class PaymentsExpensesModule { }
