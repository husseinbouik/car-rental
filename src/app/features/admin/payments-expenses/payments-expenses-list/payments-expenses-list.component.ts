// src/app/features/payments-expenses/payment-expense-list/payment-expense-list.component.ts // Adjusted path

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { finalize } from 'rxjs/operators';
import { PaymentExpense } from '../payment-expense.model'; // Renamed model import
import { PaymentExpenseService } from '../payment-expense.service'; // Renamed service import

type SortableColumn = keyof PaymentExpense | '';

@Component({
  selector: 'app-payment-expenses-list', // Renamed selector
  standalone: false, // Set to true for standalone component
  templateUrl: './payments-expenses-list.component.html', // Adjusted template path
  styleUrls: ['./payments-expenses-list.component.css'] // Adjusted style path
})
export class PaymentExpensesListComponent implements OnInit { // Renamed class
  isLoading = false;
  allPaymentExpenses: PaymentExpense[] = []; // Renamed variable
  paymentExpenses: PaymentExpense[] = []; // Renamed variable (Filtered and sorted)
  paginatedPaymentExpenses: PaymentExpense[] = []; // Renamed variable

  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  sortColumn: SortableColumn = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  public Math = Math;

  constructor(
    private paymentExpenseService: PaymentExpenseService, // Use renamed service
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPaymentExpenses(); // Renamed method call
  }

  loadPaymentExpenses(): void { // Renamed method
    this.isLoading = true;
    this.paymentExpenseService.getPaymentExpenses() // Use renamed service method
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.allPaymentExpenses = data.map(d => ({ ...d, id: Number(d.id) })); // Renamed variable
          this.applyFiltersAndSort();
        },
        error: (error) => console.error('Error fetching payment expenses:', error) // Updated log message
      });
  }

  applyFiltersAndSort(): void {
    let processedData = [...this.allPaymentExpenses]; // Use renamed variable

    // 1. Filter
    if (this.searchTerm) {
      const lowerSearchTerm = this.searchTerm.toLowerCase().trim();
      if (lowerSearchTerm) {
        processedData = processedData.filter(expense => // Keep 'expense' for lambda clarity or rename
          expense.categorie?.toLowerCase().includes(lowerSearchTerm) ||
          expense.description?.toLowerCase().includes(lowerSearchTerm) ||
          expense.montant?.toString().toLowerCase().includes(lowerSearchTerm) ||
          expense.date?.toLowerCase().includes(lowerSearchTerm)
        );
      }
    }

    // 2. Sort (Sorting logic remains the same based on PaymentExpense properties)
    if (this.sortColumn) {
        processedData.sort((a, b) => {
            const valA = a[this.sortColumn as keyof PaymentExpense];
            const valB = b[this.sortColumn as keyof PaymentExpense];
            // ... (comparison logic as before) ...
            let comparison = 0;
            if (valA == null && valB == null) comparison = 0;
            else if (valA == null) comparison = -1;
            else if (valB == null) comparison = 1;
            else if (this.sortColumn === 'date') { comparison = new Date(valA as string).getTime() - new Date(valB as string).getTime(); }
            else if (this.sortColumn === 'montant') { comparison = (valA as number) - (valB as number); }
            else if (typeof valA === 'string' && typeof valB === 'string') { comparison = valA.localeCompare(valB, undefined, { sensitivity: 'base' }); }
            else { comparison = String(valA).localeCompare(String(valB)); }
            return this.sortDirection === 'desc' ? comparison * -1 : comparison;
        });
    }

    this.paymentExpenses = processedData; // Renamed variable
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.paymentExpenses.length / this.itemsPerPage); // Use renamed variable
    // ... (rest of pagination calculation logic as before) ...
    if (this.currentPage > this.totalPages && this.totalPages > 0) { this.currentPage = this.totalPages; }
    else if (this.totalPages === 0 || this.currentPage < 1) { this.currentPage = 1; }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedPaymentExpenses = this.paymentExpenses.slice(startIndex, startIndex + this.itemsPerPage); // Use renamed variables
  }

  onSearchInput(): void {
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  sortTable(column: SortableColumn): void {
     // ... (logic as before) ...
    if (!column) return;
    if (this.sortColumn === column) { this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'; }
    else { this.sortColumn = column; this.sortDirection = 'asc'; }
    this.applyFiltersAndSort();
  }

  getSortIcon(column: SortableColumn): string {
    // ... (logic as before) ...
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  // Pagination methods (prevPage, nextPage, goToPage, getPages) remain the same

   prevPage(): void { if (this.currentPage > 1) { this.currentPage--; this.updatePagination(); } }
   nextPage(): void { if (this.currentPage < this.totalPages) { this.currentPage++; this.updatePagination(); } }
   goToPage(page: number): void { if (page >= 1 && page <= this.totalPages) { this.currentPage = page; this.updatePagination(); } }
   getPages(): number[] {
    // ... (logic as before) ...
    const pages: number[] = []; if (!this.totalPages || this.totalPages <= 1) return pages; const maxVisiblePages = 5; let startPage: number, endPage: number; if (this.totalPages <= maxVisiblePages) { startPage = 1; endPage = this.totalPages; } else { const maxPagesBefore = Math.floor(maxVisiblePages / 2); const maxPagesAfter = Math.ceil(maxVisiblePages / 2) - 1; if (this.currentPage <= maxPagesBefore) { startPage = 1; endPage = maxVisiblePages; } else if (this.currentPage + maxPagesAfter >= this.totalPages) { startPage = this.totalPages - maxVisiblePages + 1; endPage = this.totalPages; } else { startPage = this.currentPage - maxPagesBefore; endPage = this.currentPage + maxPagesAfter; } } for (let i = startPage; i <= endPage; i++) { pages.push(i); } return pages;
   }

  // --- Actions ---
  exportToExcel(): void {
    const dataToExport = this.paymentExpenses.map(exp => ({ // Use renamed variable
      ID: exp.id,
      Date: exp.date ? new Date(exp.date) : '',
      Category: exp.categorie,
      Amount: exp.montant,
      Description: exp.description,
    }));
    // ... (XLSX logic as before) ...
    const worksheet = XLSX.utils.json_to_sheet(dataToExport); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "PaymentExpenses"); XLSX.writeFile(workbook, "payment_expenses_export.xlsx"); // Renamed file
  }

  createPaymentExpense(): void { // Renamed method
    this.router.navigate(['/admin/payments-expenses/create']); // Adjusted route
  }

  editPaymentExpense(expense: PaymentExpense): void { // Renamed method, keep param name simple
    if (expense.id === null) return;
    this.router.navigate(['/admin/payments-expenses/edit', expense.id]); // Adjusted route
  }

   viewDetails(expense: PaymentExpense): void { // Renamed method
     if (expense.id === null) return;
    this.router.navigate(['/admin/payments-expenses/details', expense.id]); // Adjusted route
  }

  deletePaymentExpense(expense: PaymentExpense): void { // Renamed method
    if (expense.id === null) return;
    // Updated confirmation message
    if (confirm(`Are you sure you want to delete Payment Expense ID: ${expense.id} (${expense.categorie}: ${expense.montant})?`)) {
      this.paymentExpenseService.deletePaymentExpense(expense.id) // Use renamed service method
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          console.log('Payment expense deleted successfully'); // Updated log message
          this.allPaymentExpenses = this.allPaymentExpenses.filter(e => e.id !== expense.id); // Update renamed variable
          this.applyFiltersAndSort();
        },
        error: (error) => {
          console.error('Error deleting payment expense:', error); // Updated log message
           alert(`Failed to delete payment expense: ${error.message || 'Server error'}`); // Updated message
        }
      });
    }
  }
}
