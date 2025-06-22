import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { PaymentsExpensesRoutingModule } from './payments-expenses-routing.module';
import { PaymentExpensesListComponent } from './payments-expenses-list/payments-expenses-list.component';
import { PaymentExpensesCreateComponent } from './payment-expenses-create/payment-expenses-create.component';
import { PaymentExpensesDetailsComponent } from './payment-expenses-details/payment-expenses-details.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    PaymentExpensesListComponent,
    PaymentExpensesCreateComponent,
    PaymentExpensesDetailsComponent
  ],
  imports: [
    CommonModule,
    PaymentsExpensesRoutingModule,
    FormsModule,
    TranslateModule.forChild()
  ]
})
export class PaymentsExpensesModule { }
