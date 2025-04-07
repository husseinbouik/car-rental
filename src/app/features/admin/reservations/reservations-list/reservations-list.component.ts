import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';

// Adjust path if necessary - Make sure it points to the updated model
import { Reservation } from '../reservation.model';
import { ReservationService } from '../reservation.service';

type SortableColumn = keyof Reservation | 'clientName' | 'voitureInfo' | '';

@Component({
  selector: 'app-reservation-list',
  standalone: false,
  templateUrl: './reservations-list.component.html',
  styleUrls: ['./reservations-list.component.css']
})
export class ReservationListComponent implements OnInit {
  isLoading = false;
  allReservations: Reservation[] = [];
  reservations: Reservation[] = [];
  paginatedReservations: Reservation[] = [];

  searchTerm: string = '';

  // Pagination settings
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  // Sorting settings
  sortColumn: SortableColumn = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';
  public Math = Math;

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
        console.log('Raw data from getReservations:', data);

        this.allReservations = data.map(res => ({
          ...res,
          id: Number(res.id),
          client_id: Number(res.client_id ?? res.client?.id),
          voiture_id: Number(res.voiture_id ?? res.voiture?.id),
          conducteur_secondaire_id: res.conducteur_secondaire_id != null
            ? Number(res.conducteur_secondaire_id)
            : (res.conducteurSecondaire?.id != null ? Number(res.conducteurSecondaire.id) : null),

          client: res.client,
          voiture: res.voiture,
          conducteurSecondaire: res.conducteurSecondaire,
        }));
        console.log('Processed allReservations:', this.allReservations);
        this.applyFiltersAndSort();
        this.updatePagination();
      },
      error: (error) => console.error('Error fetching reservations:', error)
    });
  }

  applyFiltersAndSort(): void {
    let processedData = [...this.allReservations];

    if (this.searchTerm) {
      const lowerSearchTerm = this.searchTerm.toLowerCase().trim();
      if (lowerSearchTerm) {
        processedData = processedData.filter(reservation => {
          const primaryMatch = Object.entries(reservation).some(([key, val]) => {
            if (key === 'client' || key === 'voiture' || key === 'conducteurSecondaire') {
              return false;
            }
            return val !== null && val !== undefined &&
                   val.toString().toLowerCase().includes(lowerSearchTerm);
          });

          if (primaryMatch) return true;

          const client = reservation.client;
          if (client && (
              client.cname?.toLowerCase().includes(lowerSearchTerm) ||
              client.tel?.toLowerCase().includes(lowerSearchTerm) ||
              client.cin?.toLowerCase().includes(lowerSearchTerm)
          )) {
              return true;
          }

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

          const secondary = reservation.conducteurSecondaire;
          if (secondary && (
              secondary.cname?.toLowerCase().includes(lowerSearchTerm)
          )) {
              return true;
          }

          return false;
        });
      }
    }

    if (this.sortColumn) {
      processedData.sort((a, b) => {
        let valA: any;
        let valB: any;

        switch (this.sortColumn) {
          default:
            valA = a[this.sortColumn as keyof Reservation];
            valB = b[this.sortColumn as keyof Reservation];
        }

        let comparison = 0;

        if (valA === null || valA === undefined) comparison = (valB === null || valB === undefined) ? 0 : -1;
        else if (valB === null || valB === undefined) comparison = 1;
        else if (this.sortColumn === 'dateDebut' || this.sortColumn === 'dateFin') {
           comparison = new Date(valA as string).getTime() - new Date(valB as string).getTime();
        }
        else if (typeof valA === 'string' && typeof valB === 'string') {
           comparison = valA.localeCompare(valB, undefined, { sensitivity: 'base' });
        } else if (typeof valA === 'number' && typeof valB === 'number') {
           comparison = valA - valB;
        } else {
           comparison = String(valA).localeCompare(String(valB));
        }

        return this.sortDirection === 'desc' ? (comparison * -1) : comparison;
      });
    }

    this.reservations = processedData;

    if (this.searchTerm) {
        const currentFilterKey = this.searchTerm + this.sortColumn + this.sortDirection;
        if (!this._lastFilterKey || this._lastFilterKey !== currentFilterKey) {
           this.currentPage = 1;
        }
        this._lastFilterKey = currentFilterKey;
    } else if (!this.sortColumn) {
        this.currentPage = 1;
    }
    this.updatePagination();
  }

  private _lastFilterKey: string | null = null;

  onSearchInput(): void {
    this.applyFiltersAndSort();
  }

  sortTable(column: SortableColumn): void {
    if (!column) return;

    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  getSortIcon(column: SortableColumn): string {
    if (this.sortColumn !== column) {
      return 'fa-sort';
    }
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.reservations.length / this.itemsPerPage);

    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    this.paginatedReservations = this.reservations.slice(startIndex, endIndex);
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

    const maxVisiblePages = 5;
    let startPage: number, endPage: number;

    if (this.totalPages <= maxVisiblePages) {
        startPage = 1;
        endPage = this.totalPages;
    } else {
        const maxPagesBeforeCurrentPage = Math.floor(maxVisiblePages / 2);
        const maxPagesAfterCurrentPage = Math.ceil(maxVisiblePages / 2) - 1;
        if (this.currentPage <= maxPagesBeforeCurrentPage) {
            startPage = 1;
            endPage = maxVisiblePages;
        } else if (this.currentPage + maxPagesAfterCurrentPage >= this.totalPages) {
            startPage = this.totalPages - maxVisiblePages + 1;
            endPage = this.totalPages;
        } else {
            startPage = this.currentPage - maxPagesBeforeCurrentPage;
            endPage = this.currentPage + maxPagesAfterCurrentPage;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    return pages;
  }

  exportToExcel(): void {
     const dataToExport = this.reservations.map(res => ({
        ID: res.id,
        Deposit: res.acompte,
        'Start Date': res.dateDebut ? new Date(res.dateDebut) : '',
        'End Date': res.dateFin ? new Date(res.dateFin) : '',
        'Total Amount': res.montantTotal,
        Status: res.statut,
        'Client Name': res.client?.cname,
        'Car Info': res.voiture?.marque || res.voiture?.modele || res.voiture?.vname ?
                     `${res.voiture.marque} ${res.voiture.modele} ${res.voiture.vname}` : ''
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reservations');
    XLSX.writeFile(wb, 'reservations.xlsx');
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




