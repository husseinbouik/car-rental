// src/app/features/reservations/reservations-list/reservations-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

// Adjust path if necessary - Make sure it points to the updated model
import { Reservation } from '../reservation.model';
import { ReservationService } from '../reservation.service';
// Import Client and Voiture if needed for type checking, though Reservation model already includes them
// import { Client } from '../../clients/client.model';
// import { Voiture } from '../../vehicles/voiture.model';

// Define the possible sortable columns
// We'll primarily sort by IDs or direct properties for simplicity,
// but keep the type flexible. Sorting by nested properties adds complexity.
type SortableColumn = keyof Reservation | 'clientName' | 'voitureInfo' | '';

@Component({
  selector: 'app-reservation-list',
  standalone: false, // Or true if using standalone
  templateUrl: './reservations-list.component.html',
  styleUrls: ['./reservations-list.component.css']
})
export class ReservationListComponent implements OnInit {
  isLoading = false; // Initialize to false or true depending on preference

  allReservations: Reservation[] = []; // Holds the original unfiltered list
  reservations: Reservation[] = [];     // Holds the currently displayed list (filtered and sorted)
  paginatedReservations: Reservation[] = []; // Holds the data for the current page

  searchTerm: string = '';

  // Pagination settings
  currentPage: number = 1;
  itemsPerPage: number = 10; // Adjust as needed
  totalPages: number = 1;

  // Sorting settings
  // Default sort can be by ID or dateDebut
  sortColumn: SortableColumn = 'id';
  sortDirection: 'asc' | 'desc' = 'desc'; // Often useful to see newest first
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
        console.log('Raw data from getReservations:', data); // Check if nested objects are present

        // Map the data, ensuring correct types and handling potential missing nested objects
        this.allReservations = data.map(res => ({
          ...res,
          id: Number(res.id), // Ensure id is number
          // Make sure IDs are present even if nested objects are missing
          client_id: Number(res.client_id ?? res.client?.id),
          voiture_id: Number(res.voiture_id ?? res.voiture?.id),
          conducteur_secondaire_id: res.conducteur_secondaire_id != null
            ? Number(res.conducteur_secondaire_id)
            : (res.conducteurSecondaire?.id != null ? Number(res.conducteurSecondaire.id) : null),

          // Keep nested objects if they exist in the response 'data'
          client: res.client,
          voiture: res.voiture,
          conducteurSecondaire: res.conducteurSecondaire,
        }));
        console.log('Processed allReservations:', this.allReservations); // Verify mapping
        this.applyFiltersAndSort(); // Apply initial sort and pagination
      },
      error: (error) => console.error('Error fetching reservations:', error)
    });
  }

  // Combined function to handle filtering and sorting
  applyFiltersAndSort(): void {
    let processedData = [...this.allReservations];

    // 1. Apply Search Filter
    if (this.searchTerm) {
      const lowerSearchTerm = this.searchTerm.toLowerCase().trim();
      if (lowerSearchTerm) {
          processedData = processedData.filter(reservation => {
            // Check primary fields
            const primaryMatch = Object.entries(reservation).some(([key, val]) => {
              // Exclude nested objects from this basic check
              if (key === 'client' || key === 'voiture' || key === 'conducteurSecondaire') {
                  return false;
              }
              return val !== null && val !== undefined &&
                     val.toString().toLowerCase().includes(lowerSearchTerm);
            });

            if (primaryMatch) return true;

            // Check nested client fields (if client object exists)
            const client = reservation.client;
            if (client && (
                client.cname?.toLowerCase().includes(lowerSearchTerm) ||
                client.tel?.toLowerCase().includes(lowerSearchTerm) ||
                client.cin?.toLowerCase().includes(lowerSearchTerm)
            )) {
                return true;
            }

            // Check nested voiture fields (if voiture object exists)
            const voiture = reservation.voiture;
            if (voiture && (
                voiture.vname?.toLowerCase().includes(lowerSearchTerm) ||
                voiture.marque?.toLowerCase().includes(lowerSearchTerm) ||
                voiture.modele?.toLowerCase().includes(lowerSearchTerm) ||
                voiture.matricule?.toLowerCase().includes(lowerSearchTerm) ||
                voiture.couleur?.toLowerCase().includes(lowerSearchTerm)
            )) {
                return true;
            }

            // Check nested secondary driver fields (if object exists)
            const secondary = reservation.conducteurSecondaire;
             if (secondary && (
                secondary.cname?.toLowerCase().includes(lowerSearchTerm)
            )) {
                return true;
            }

            return false; // No match found
        });
      }
    }

    // 2. Apply Sorting
    if (this.sortColumn) {
      processedData.sort((a, b) => {
        let valA: any;
        let valB: any;

        // Handle potential sorting by derived/nested properties
        switch (this.sortColumn) {
          // Example: If you wanted to sort by client name (adds complexity)
          // case 'clientName':
          //   valA = a.client?.cname ?? a.client?.nom ?? ''; // Fallback logic
          //   valB = b.client?.cname ?? b.client?.nom ?? '';
          //   break;
          // Example: If you wanted to sort by car model/name (adds complexity)
          // case 'voitureInfo':
          //   valA = a.voiture?.marque ?? a.voiture?.vname ?? '';
          //   valB = b.voiture?.marque ?? b.voiture?.vname ?? '';
          //   break;
          default:
            // Default to sorting by direct properties or IDs
            valA = a[this.sortColumn as keyof Reservation];
            valB = b[this.sortColumn as keyof Reservation];
        }

        let comparison = 0;

        // Handle nulls/undefined first
        if (valA === null || valA === undefined) comparison = (valB === null || valB === undefined) ? 0 : -1;
        else if (valB === null || valB === undefined) comparison = 1;
        // Specific type handling
        else if (this.sortColumn === 'dateDebut' || this.sortColumn === 'dateFin') {
           comparison = new Date(valA as string).getTime() - new Date(valB as string).getTime();
        }
        else if (typeof valA === 'string' && typeof valB === 'string') {
           comparison = valA.localeCompare(valB, undefined, { sensitivity: 'base' }); // Case-insensitive compare
        } else if (typeof valA === 'number' && typeof valB === 'number') {
           comparison = valA - valB;
        } else {
           // Fallback for mixed types or others
           comparison = String(valA).localeCompare(String(valB));
        }

        return this.sortDirection === 'desc' ? (comparison * -1) : comparison;
      });
    }

    // 3. Update the main list and pagination
    this.reservations = processedData;
    // Reset to page 1 only when filter criteria change, not just sorting
    // A simple way is to check if the search term caused the filter
    if (this.searchTerm) {
        const currentFilterKey = this.searchTerm + this.sortColumn + this.sortDirection;
        if (!this._lastFilterKey || this._lastFilterKey !== currentFilterKey) {
           this.currentPage = 1;
        }
        this._lastFilterKey = currentFilterKey; // Store the state
    } else if (!this.sortColumn) { // Reset if search is cleared and no sort
        this.currentPage = 1;
    }
    // Always update pagination view based on current state
    this.updatePagination();
  }
  private _lastFilterKey: string | null = null; // Helper for pagination reset logic


  // --- Search ---
  onSearchInput(): void {
    // Resetting page is handled within applyFiltersAndSort now
    this.applyFiltersAndSort();
  }

  // --- Sorting ---
  sortTable(column: SortableColumn): void {
    if (!column) return;

    if (this.sortColumn === column) {
      // Reverse direction if same column clicked again
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Sort by new column, default to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    // Don't reset page number when only sorting
    this.applyFiltersAndSort();
  }

  getSortIcon(column: SortableColumn): string {
    if (this.sortColumn !== column) {
      return 'fa-sort'; // Default icon (neutral)
    }
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  // --- Pagination --- (Keep existing logic, but ensure updatePagination is called)
  updatePagination(): void {
    this.totalPages = Math.ceil(this.reservations.length / this.itemsPerPage);
     if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = this.totalPages; // Adjust if current page becomes invalid
    } else if (this.totalPages === 0) {
        this.currentPage = 1; // Reset to page 1 if no results
    } else if (this.currentPage < 1) {
        this.currentPage = 1; // Ensure current page is at least 1
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
    if (!this.totalPages || this.totalPages <= 1) return pages;

    const maxVisiblePages = 5; // Number of page links to show
    let startPage: number, endPage: number;

    if (this.totalPages <= maxVisiblePages) {
        // Less than maxVisiblePages total pages, so show all
        startPage = 1;
        endPage = this.totalPages;
    } else {
        // More than maxVisiblePages total pages, calculate range
        const maxPagesBeforeCurrentPage = Math.floor(maxVisiblePages / 2);
        const maxPagesAfterCurrentPage = Math.ceil(maxVisiblePages / 2) - 1;
        if (this.currentPage <= maxPagesBeforeCurrentPage) {
            // Near the start
            startPage = 1;
            endPage = maxVisiblePages;
        } else if (this.currentPage + maxPagesAfterCurrentPage >= this.totalPages) {
            // Near the end
            startPage = this.totalPages - maxVisiblePages + 1;
            endPage = this.totalPages;
        } else {
            // Somewhere in the middle
            startPage = this.currentPage - maxPagesBeforeCurrentPage;
            endPage = this.currentPage + maxPagesAfterCurrentPage;
        }
    }

    // Create the array of pages
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    return pages;
  }


  // --- Actions ---
  exportToExcel(): void {
     // Prepare data for export, including nested object details if available
     const dataToExport = this.reservations.map(res => ({
        ID: res.id,
        Deposit: res.acompte,
        'Start Date': res.dateDebut ? new Date(res.dateDebut) : '', // Format as Date
        'End Date': res.dateFin ? new Date(res.dateFin) : '',       // Format as Date
        'Total Amount': res.montantTotal,
        Status: res.statut,
        'Client Name': res.client?.cname , // Use name, fallback to ID
        'Car Info': res.voiture?.marque || res.voiture?.modele || res.voiture?.vname ?
                     `${res.voiture.marque ?? ''} ${res.voiture.modele ?? res.voiture.vname ?? ''} (${res.voiture.matricule ?? 'N/A'})`
                     : `ID: ${res.voiture_id}`, // Use details, fallback to ID
        'Sec. Driver': res.conducteurSecondaire?.cname ??  (res.conducteur_secondaire_id ? `ID: ${res.conducteur_secondaire_id}` : 'N/A') // Use name, fallback to ID or N/A
     }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Optional: Define column widths (example)
    // const columnWidths = [
    //     { wch: 8 }, // ID
    //     { wch: 12 }, // Deposit
    //     { wch: 20 }, // Start Date
    //     { wch: 20 }, // End Date
    //     { wch: 15 }, // Total Amount
    //     { wch: 12 }, // Status
    //     { wch: 30 }, // Client Name
    //     { wch: 40 }, // Car Info
    //     { wch: 30 }, // Sec. Driver
    // ];
    // worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reservations");
    XLSX.writeFile(workbook, "reservations_export.xlsx");
  }

  createReservation(): void {
    this.router.navigate(['/admin/reservations/create']); // Adjust route as needed
  }

  editReservation(reservation: Reservation): void {
    if (reservation.id === null) return;
    this.router.navigate(['/admin/reservations/edit', reservation.id]); // Adjust route
  }

  deleteReservation(reservation: Reservation): void {
     if (reservation.id === null) return;
    if (confirm(`Are you sure you want to delete reservation ID: ${reservation.id}? This action cannot be undone.`)) {
      this.reservationService.deleteReservation(reservation.id).subscribe({
        next: () => {
          console.log('Reservation deleted successfully');
          // Remove from the master list
          this.allReservations = this.allReservations.filter(r => r.id !== reservation.id);
          // Re-apply filter/sort which will update the view and pagination
          this.applyFiltersAndSort();
        },
        error: (error) => {
            console.error('Error deleting reservation:', error);
            alert(`Failed to delete reservation: ${error.message || 'Server error'}`); // Provide user feedback
        }
      });
    }
  }

  viewDetails(reservation: Reservation): void {
     if (reservation.id === null) return;
    // You might navigate to a dedicated details page or open a modal
    this.router.navigate(['/admin/reservations/details', reservation.id]); // Adjust route as needed
    // Or: Implement a modal display logic here
  }
}
