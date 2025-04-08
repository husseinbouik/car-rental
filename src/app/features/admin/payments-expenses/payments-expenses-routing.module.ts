// src/app/admin/payments-expenses/payments-expenses-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../../guards/role-guard.guard';
import { PaymentsExpensesListComponent } from './payments-expenses-list/payments-expenses-list.component';
import { PaymentExpensesCreateComponent } from './payment-expenses-create/payment-expenses-create.component';
import { PaymentExpensesDetailsComponent } from './payment-expenses-details/payment-expenses-details.component';

const routes: Routes = [
  {
    path: '',
    component: PaymentsExpensesListComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'payements-expenses/create',
    component: PaymentExpensesCreateComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'payements-expenses/:id',
    component: PaymentExpensesDetailsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {
    path: 'payements-expenses/:id/edit',
    component: PaymentExpensesCreateComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ROLE_ADMIN'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentsExpensesRoutingModule { }
