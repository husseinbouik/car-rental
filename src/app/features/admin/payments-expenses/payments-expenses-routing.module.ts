import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentsExpensesListComponent } from './payments-expenses-list/payments-expenses-list.component';
import { PaymentExpensesCreateComponent } from './payment-expenses-create/payment-expenses-create.component';
import { PaymentExpensesDetailsComponent } from './payment-expenses-details/payment-expenses-details.component';

const routes: Routes = [
  { path: '', component: PaymentsExpensesListComponent },
  { path: 'payements-expenses/create', component: PaymentExpensesCreateComponent },
  { path: 'payements-expenses/:id', component: PaymentExpensesDetailsComponent },
  {path : 'payements-expenses/:id/edit', component: PaymentExpensesCreateComponent},
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentsExpensesRoutingModule { }
