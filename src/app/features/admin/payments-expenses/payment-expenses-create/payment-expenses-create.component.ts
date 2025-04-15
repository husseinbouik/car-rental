

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, formatDate } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { PaymentExpense } from '../payment-expense.model';
import { PaymentExpenseService } from '../payment-expense.service';

@Component({
  selector: 'app-payment-expenses-create',
  standalone: false,
  templateUrl: './payment-expenses-create.component.html',
  styleUrls: ['./payment-expenses-create.component.css']
})
export class PaymentExpensesCreateComponent implements OnInit {


  isEditMode = false;
  isLoading = false;
  errorMessage: string | null = null;
  pageTitle = 'Record New Payment/Expense';
  submitButtonText = 'Record Payment/Expense';
  paymentExpenseId: number | null = null;


  paymentExpense: PaymentExpense = {
    id: null,
    montant: null as any,
    categorie: '',
    date: this.formatDateForInput(new Date()),
    description: ''
  };



  expenseCategories: string[] = ['Income', 'Fuel', 'Maintenance', 'Insurance', 'Cleaning', 'Tolls', 'Repairs', 'Office Supplies', 'Salary', 'Utilities', 'Rent', 'Other'];

  constructor(
    private paymentExpenseService: PaymentExpenseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.paymentExpenseId = +idParam;
      if (!isNaN(this.paymentExpenseId)) {

        this.isEditMode = true;
        this.pageTitle = 'Edit Payment/Expense Record';
        this.submitButtonText = 'Save Changes';
        this.loadPaymentExpenseData(this.paymentExpenseId);
      } else {
        this.errorMessage = `Invalid Record ID provided: ${idParam}`;
        this.isLoading = false;
      }
    } else {

      this.isEditMode = false;
      this.pageTitle = 'Record New Payment/Expense';
      this.submitButtonText = 'Record Payment/Expense';

      this.paymentExpense = {
        id: null,
        montant: null as any,
        categorie: '',
        date: this.formatDateForInput(new Date()),
        description: ''
      };
      this.isLoading = false;
    }
  }

  /**
   * Fetches existing data for editing.
   */
  loadPaymentExpenseData(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.paymentExpenseService.getPaymentExpenseById(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          if (data) {
            this.paymentExpense = {
                ...data,
                date: this.formatDateForInput(data.date)
            };
            console.log("Loaded payment/expense data:", this.paymentExpense);
          } else {
            this.errorMessage = `Record with ID ${id} not found.`;
          }
        },
        error: (err) => {
          console.error('Error fetching payment/expense:', err);
          this.errorMessage = `Failed to load record data (ID: ${id}). Please try again.`;
        }
      });
  }

  /**
   * Formats Date or ISO string to 'yyyy-MM-ddTHH:mm' for datetime-local input.
   */
  formatDateForInput(dateValue: string | Date | null | undefined): string {
    if (!dateValue) return '';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      return formatDate(date, 'yyyy-MM-ddTHH:mm', 'en-US');
    } catch (e) {
      console.error("Error formatting date for input:", e);
      return '';
    }
  }

  /**
   * Handles form submission.
   */
  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = null;


    let isoDateString: string;
    try {
        const localDate = new Date(this.paymentExpense.date);
        if(isNaN(localDate.getTime())) throw new Error('Invalid date');
        isoDateString = localDate.toISOString();
    } catch(e) {
        this.errorMessage = 'Invalid date/time value entered.';
        this.isLoading = false;
        return;
    }


    const expenseDataToSend: PaymentExpense = {
      ...this.paymentExpense,

      id: this.isEditMode ? this.paymentExpenseId : null,
      montant: Number(this.paymentExpense.montant ?? 0),
      date: isoDateString
    };






    console.log("Submitting data:", expenseDataToSend);


    const operation = this.isEditMode
      ? this.paymentExpenseService.updatePaymentExpense(expenseDataToSend)
      : this.paymentExpenseService.createPaymentExpense(expenseDataToSend);


    operation
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          console.log(`Record ${this.isEditMode ? 'updated' : 'created'} successfully`, response);
          this.router.navigate(['/admin/payments-expenses'], {
            state: { successMessage: `Record ${this.isEditMode ? 'updated' : 'created'} successfully!` }
          });
        },
        error: (err: HttpErrorResponse) => {
          console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} record:`, err);
           if (err.error && typeof err.error === 'string' && err.status !== 500) {
               this.errorMessage = err.error;
           } else if (err.error && err.error.message) {
               this.errorMessage = err.error.message;
           } else {
               this.errorMessage = `Failed to ${this.isEditMode ? 'save' : 'create'} record. Status: ${err.status} - ${err.statusText || 'Unknown error'}.`;
           }
        }
      });
  }


  cancel(): void {
    this.router.navigate(['/admin/payments-expenses']);
  }
}
