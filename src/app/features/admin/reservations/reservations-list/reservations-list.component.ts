import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Reservation } from '../reservation.model'; // Ensure path is correct
import { ReservationService } from '../reservation.service'; // Ensure path is correct
import * as XLSX from 'xlsx';

// Define the possible sortable columns using the keys of the Reservation model
// Adjust based on the actual properties of your Reservation interface
type SortableColumn = keyof Reservation | ''; // Allow empty string for no sort

@Component({
  selector: 'app-reservation-list',
  standalone: false, // Keep as needed
  templateUrl: './reservations-list.component.html',
  styleUrls: ['./reservations-list.component.css']
})
export class ReservationListComponent implements OnInit {

  allReservations: Reservation[] = []; // Holds the original unfiltered list
  reservations: Reservation[] = [];     // Holds the currently displayed list (filtered and sorted)
  paginatedReservations: Reservation[] = []; // Holds the data for the current page

  searchTerm: string = '';

  // Pagination settings
  currentPage: number = 1;
  itemsPerPage: number = 5; // Or your desired items per page
  totalPages: number = 1;

  // Sorting settings
  sortColumn: SortableColumn = ''; // Column currently sorted by
  sortDirection: 'asc' | 'desc' = 'asc'; // Sort direction
  public Math = Math; // Expose Math to the template

  constructor(
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.reservationService.getReservations().subscribe({
      next: (data) => {
        this.allReservations = data; // Store the original data
        // Initialize the displayed list (apply initial filter/sort if needed)
        this.applyFiltersAndSort();
      },
      error: (error) => console.error('Error fetching reservations:', error)
    });
  }

  // Combined function to handle filtering and sorting
  applyFiltersAndSort(): void {
    // 1. Start with the original data
    let processedData = [...this.allReservations];

    // 2. Apply Search Filter
    if (this.searchTerm) {
      const lowerSearchTerm = this.searchTerm.toLowerCase();
      processedData = processedData.filter(reservation =>
        Object.values(reservation).some(val => // Search across all string/number/date values
          val !== null && val !== undefined &&
          val.toString().toLowerCase().includes(lowerSearchTerm)
        )
        // Add more specific checks if needed, e.g., for dates or related objects
        // (reservation.client?.nom?.toLowerCase().includes(lowerSearchTerm)) || // Example if client data is loaded
        // (reservation.voiture?.matricule?.toLowerCase().includes(lowerSearchTerm)) // Example if voiture data is loaded
      );
    }

    // 3. Apply Sorting
    if (this.sortColumn) {
      const column = this.sortColumn; // No need for !, already checked it's truthy
      processedData.sort((a, b) => {
        const valA = a[column];
        const valB = b[column];

        let comparison = 0;

        // Handle nulls/undefined first
        if (valA === null || valA === undefined) comparison = -1;
        else if (valB === null || valB === undefined) comparison = 1;
        // Specific type handling
        else if (column === 'dateDebut' || column === 'dateFin') {
           // Basic date comparison (assumes string format sortable or actual Date objects)
           // For more robust date sorting, convert to timestamps:
           // comparison = new Date(valA).getTime() - new Date(valB).getTime();
           comparison = String(valA).localeCompare(String(valB)); // Simple string compare for dates for now
        }
        else if (typeof valA === 'string' && typeof valB === 'string') {
           comparison = valA.localeCompare(valB);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
           comparison = valA - valB;
        } else {
           // Fallback for mixed types or others
           comparison = String(valA).localeCompare(String(valB));
        }

        return this.sortDirection === 'desc' ? (comparison * -1) : comparison;
      });
    }

    // 4. Update the main list and pagination
    this.reservations = processedData;
    // Don't reset page if only sorting on the current view
    if (!this.sortColumn || this.searchTerm) {
        this.currentPage = 1; // Reset to first page only after filtering
    }
    this.updatePagination();
  }

  // --- Search ---
  onSearchInput(): void {
    // Reset to page 1 when search term changes
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  // --- Sorting ---
  sortTable(column: SortableColumn): void {
    if (!column) return;

    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    // Don't reset page when only sorting
    // this.currentPage = 1; // Avoid resetting page just for sort
    this.applyFiltersAndSort(); // Re-apply filters and sort
  }

  getSortIcon(column: SortableColumn): string {
    if (this.sortColumn !== column) {
      return 'fa-sort'; // Default icon
    }
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  // --- Pagination ---
  updatePagination(): void {
    this.totalPages = Math.ceil(this.reservations.length / this.itemsPerPage);
     if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = this.totalPages; // Go to last page if current page is invalid
    } else if (this.totalPages === 0) {
        this.currentPage = 1; // Reset to 1 if no results
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedReservations = this.reservations.slice(startIndex, startIndex + this.itemsPerPage);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    if (this.totalPages === 0) return pages;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage === this.totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // --- Actions ---
  exportToExcel(): void {
    // Export the currently filtered and sorted list
    const worksheet = XLSX.utils.json_to_sheet(this.reservations); // Use the filtered/sorted list
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reservations");
    XLSX.writeFile(workbook, "reservations_export.xlsx");
  }

  createReservation(): void {
    this.router.navigate(['/admin/reservations/create']);
  }

  editReservation(reservation: Reservation): void {
    this.router.navigate(['/admin/reservations/edit', reservation.id]);
  }

  deleteReservation(reservation: Reservation): void {
    if (confirm(`Are you sure you want to delete reservation ID: ${reservation.id}?`)) {
      this.reservationService.deleteReservation(reservation.id).subscribe({
        next: () => {
          console.log('Reservation deleted successfully');
          // Remove from both lists for immediate UI update
          this.allReservations = this.allReservations.filter(r => r.id !== reservation.id);
          this.applyFiltersAndSort(); // Re-filter, sort, and paginate
        },
        error: (error) => console.error('Error deleting reservation:', error)
      });
    }
  }

  viewDetails(reservation: Reservation): void {
    this.router.navigate(['/admin/reservations/details', reservation.id]);
  }
}
