import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { PaymentExpense } from './payment-expense.model';
import { MOCK_PAYMENTS_EXPENSES } from './mock-payments-expenses';

@Injectable({
  providedIn: 'root'
})
export class PaymentExpenseService {
  constructor() {}

  getPaymentsExpenses(): Observable<PaymentExpense[]> {
    return of(MOCK_PAYMENTS_EXPENSES);
  }

  getPaymentExpenseById(id: number): Observable<PaymentExpense | undefined> {
    const paymentExpense = MOCK_PAYMENTS_EXPENSES.find(pe => pe.id === id);
    return of(paymentExpense);
  }

  createPaymentExpense(paymentExpense: PaymentExpense): Observable<PaymentExpense> {
    const newId = Math.max(...MOCK_PAYMENTS_EXPENSES.map(pe => pe.id)) + 1;
    const newPaymentExpense = { ...paymentExpense, id: newId };
    MOCK_PAYMENTS_EXPENSES.push(newPaymentExpense);
    return of(newPaymentExpense);
  }

  updatePaymentExpense(paymentExpense: PaymentExpense): Observable<PaymentExpense> {
    const index = MOCK_PAYMENTS_EXPENSES.findIndex(pe => pe.id === paymentExpense.id);
    if (index !== -1) {
      MOCK_PAYMENTS_EXPENSES[index] = paymentExpense;
    }
    return of(paymentExpense);
  }

  deletePaymentExpense(id: number): Observable<void> {
    const index = MOCK_PAYMENTS_EXPENSES.findIndex(pe => pe.id === id);
    if (index !== -1) {
      MOCK_PAYMENTS_EXPENSES.splice(index, 1);
    }
    return of(undefined);
  }
}
