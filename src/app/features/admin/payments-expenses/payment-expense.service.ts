// src/app/features/payments-expenses/payment-expense.service.ts // Adjusted path

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http'; // Import HttpHeaders and HttpErrorResponse
import { Observable, throwError } from 'rxjs'; // Import throwError
import { catchError } from 'rxjs/operators'; // Import catchError
import { PaymentExpense } from './payment-expense.model';
import { environment } from '../../../../environments/environment'; // Verify path to environment

@Injectable({
  providedIn: 'root'
})
export class PaymentExpenseService {

  // Ensure base URL is correct and consistent
  private apiUrlBase = environment.apiBaseUrl; // Make sure this points to your backend base (e.g., http://localhost:8080)
  private apiUrlExpenses = `${this.apiUrlBase}/api/finance/expenses`; // GET all
  private apiUrlExpense = `${this.apiUrlBase}/api/finance/expense`;   // GET one, POST, PUT, DELETE

  constructor(private http: HttpClient) {}

  /**
   * Creates HttpHeaders with Authorization Bearer token if available in localStorage.
   */
  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('access_token'); // Or your specific token key
    // console.log('Token from localStorage:', token); // Debugging line
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        // Conditionally add the Authorization header
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      })
    };
  }

  // GET: Retrieve all payment expenses with Auth Headers
  getPaymentExpenses(): Observable<PaymentExpense[]> {
    return this.http.get<PaymentExpense[]>(this.apiUrlExpenses, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // GET: Retrieve a single payment expense by ID with Auth Headers
  getPaymentExpenseById(id: number): Observable<PaymentExpense> {
    return this.http.get<PaymentExpense>(`${this.apiUrlExpense}/${id}`, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // POST: Create a new payment expense with Auth Headers
  createPaymentExpense(paymentExpense: Omit<PaymentExpense, 'id'> | PaymentExpense): Observable<PaymentExpense> {
    const expenseToSend = { ...paymentExpense };
    // Handle potential null/0 ID if necessary for your backend on create
    // if (!this.isEditMode && (expenseToSend.id === null || expenseToSend.id === 0)) {
    //   delete expenseToSend.id;
    // }
    return this.http.post<PaymentExpense>(this.apiUrlExpense, expenseToSend, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // PUT: Update an existing payment expense with Auth Headers
  updatePaymentExpense(paymentExpense: PaymentExpense): Observable<PaymentExpense> {
    if (paymentExpense.id === null) {
      // Use throwError correctly for synchronous error
      return throwError(() => new Error('Payment Expense ID cannot be null for an update operation.'));
    }
    // API spec uses PUT /api/finance/expense (no ID in path)
    return this.http.put<PaymentExpense>(this.apiUrlExpense, paymentExpense, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // DELETE: Delete a payment expense by ID with Auth Headers
  deletePaymentExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlExpense}/${id}`, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Basic error handling for HTTP requests.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      // The response body may contain clues as to what went wrong
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: `, error.error); // Log the actual error body
       // Try to extract a message from the backend error response
       if (error.error && typeof error.error === 'string') {
           errorMessage = error.error;
       } else if (error.error && error.error.message) {
           errorMessage = error.error.message;
       } else {
           errorMessage = `Server returned status ${error.status}: ${error.statusText || 'Unknown server error'}`;
       }

       // Handle specific status codes if needed
       if (error.status === 401) { // Unauthorized
           errorMessage = 'Unauthorized: Please log in again.';
           // Optionally: Trigger logout or redirect to login
           // this.authService.logout(); // Example
       } else if (error.status === 403) { // Forbidden
            errorMessage = 'Forbidden: You do not have permission to perform this action.';
       }

    }
    console.error('Complete error object:', error); // Log the full error object
    // Return an observable with a user-facing error message
    // Ensure the function signature matches () => Error
    return throwError(() => new Error(errorMessage));
  }
}
