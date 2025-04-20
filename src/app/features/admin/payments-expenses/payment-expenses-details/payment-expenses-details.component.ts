// src/app/features/payments-expenses/payment-expenses-details/payment-expenses-details.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PaymentExpenseService } from '../payment-expense.service'; // Adjust path
import { PaymentExpense } from '../payment-expense.model';       // Adjust path
import { CommonModule } from '@angular/common'; // Import CommonModule for pipes and directives

@Component({
  selector: 'app-payment-expenses-details',
  standalone: false, // Set to true for standalone component
  templateUrl: './payment-expenses-details.component.html',
  styleUrls: ['./payment-expenses-details.component.css'] // Corrected property name
})
export class PaymentExpensesDetailsComponent implements OnInit { // Renamed class
  paymentExpense: PaymentExpense | undefined; // Renamed variable
  isLoading = false;
  errorMessage: string | null = null;
  paymentExpenseId: number | null = null; // Renamed variable

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentExpenseService: PaymentExpenseService // Use renamed service
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.paymentExpenseId = +idParam; // Renamed variable
      if (!isNaN(this.paymentExpenseId)) {
        this.loadPaymentExpenseDetails(this.paymentExpenseId); // Renamed method call
      } else {
        this.errorMessage = `Invalid Record ID provided: ${idParam}`; // Updated message
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'No Record ID provided in the route.'; // Updated message
      this.isLoading = false;
    }
  }

  loadPaymentExpenseDetails(id: number): void { // Renamed method
    this.isLoading = true;
    this.errorMessage = null;
    this.paymentExpenseService.getPaymentExpenseById(id) // Use renamed service method
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
           if(!data) {
                this.errorMessage = `Record with ID ${id} not found.`; // Updated message
           }
           this.paymentExpense = data; // Renamed variable
           console.log("Fetched payment/expense details:", data); // Updated log
        },
        error: (error) => {
          console.error('Error fetching payment/expense details:', error); // Updated log
          this.errorMessage = `Failed to load record details for ID ${id}.`; // Updated message
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/admin/payments-expenses']); // Adjusted route
  }

  goToEdit(): void {
    if (this.paymentExpense?.id) { // Use renamed variable
      this.router.navigate(['/admin/payments-expenses/edit', this.paymentExpense.id]); // Adjusted route
    }
  }
}
