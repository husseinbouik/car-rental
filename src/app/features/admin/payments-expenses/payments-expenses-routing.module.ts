import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentsExpensesComponent } from './payments-expenses.component';

const routes: Routes = [{ path: '', component: PaymentsExpensesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentsExpensesRoutingModule { }
