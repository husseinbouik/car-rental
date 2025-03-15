export interface PaymentExpense {
  id: number;
  type: string; // e.g., "Payment", "Expense"
  amount: number;
  date: Date;
  description: string;
}
