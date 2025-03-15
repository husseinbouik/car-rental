import { PaymentExpense } from './payment-expense.model';

export const MOCK_PAYMENTS_EXPENSES: PaymentExpense[] = [
  { id: 1, type: 'Payment', amount: 1000, date: new Date('2023-10-01'), description: 'Client Payment' },
  { id: 2, type: 'Expense', amount: 500, date: new Date('2023-10-05'), description: 'Maintenance Cost' },
];
