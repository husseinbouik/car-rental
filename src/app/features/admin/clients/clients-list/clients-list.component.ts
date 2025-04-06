import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientService } from '../client.service';
import { Client } from '../client.model';
import * as XLSX from 'xlsx';

// Define the possible sortable columns using the keys of the Client model
type SortableColumn = keyof Client | '';

@Component({
  selector: 'app-client-list',
  standalone: false, // Keep as needed for your project structure
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.css']
})
export class ClientListComponent implements OnInit {
  allClients: Client[] = []; // Holds the original unfiltered list
  clients: Client[] = [];     // Holds the currently displayed list (filtered and sorted)
  paginatedClients: Client[] = []; // Holds the data for the current page

  searchTerm: string = '';

  // Pagination settings
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  // Sorting settings
  sortColumn: SortableColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  public Math = Math;

  constructor(
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  // Fetch all clients
  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.allClients = clients;
        this.applyFiltersAndSort();
      },
      error: (error) => console.error('Error fetching clients:', error)
    });
  }

  // Combined function to handle filtering and sorting
  applyFiltersAndSort(): void {
    // 1. Start with the original data
    let processedData = [...this.allClients];

    // 2. Apply Search Filter
    if (this.searchTerm) {
      const lowerSearchTerm = this.searchTerm.toLowerCase();
      processedData = processedData.filter(client =>
        Object.values(client).some(val =>
          val !== null && val !== undefined &&
          val.toString().toLowerCase().includes(lowerSearchTerm)
        )
      );
    }

    // 3. Apply Sorting
    if (this.sortColumn) {
      const column = this.sortColumn;
      processedData.sort((a, b) => {
        const valA = a[column];
        const valB = b[column];

        let comparison = 0;

        if (valA === null || valA === undefined) comparison = -1;
        else if (valB === null || valB === undefined) comparison = 1;
        else if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else {
          comparison = String(valA).localeCompare(String(valB));
        }

        return this.sortDirection === 'desc' ? (comparison * -1) : comparison;
      });
    }

    // 4. Update the main list and pagination
    this.clients = processedData;
    this.currentPage = 1;
    this.updatePagination();
  }

  // Search functionality
  onSearchInput(): void {
    this.applyFiltersAndSort();
  }

  // Sorting functionality
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

  // Helper for sort icons
  getSortIcon(column: SortableColumn): string {
    if (this.sortColumn !== column) {
      return 'fa-sort';
    }
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  // Pagination functionality
  updatePagination(): void {
    this.totalPages = Math.ceil(this.clients.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedClients = this.clients.slice(startIndex, startIndex + this.itemsPerPage);
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

  // Export functionality
  exportToExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(this.clients);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
    XLSX.writeFile(workbook, "clients_export.xlsx");
  }

  // Navigate to the create client page
  createClient(): void {
    this.router.navigate(['/admin/clients/create']);
  }

  // Navigate to the edit client page
  editClient(client: Client): void {
    this.router.navigate(['/admin/clients/edit', client.id]);
  }

  // Delete a client
  deleteClient(client: Client): void {
    if (confirm('Are you sure you want to delete this client?')) {
      this.clientService.deleteClient(client.id).subscribe({
        next: () => {
          console.log('Client deleted successfully');
          // Remove from both lists to avoid full reload
          this.allClients = this.allClients.filter(c => c.id !== client.id);
          this.applyFiltersAndSort();
        },
        error: (error) => console.error('Error deleting client:', error)
      });
    }
  }

  // Navigate to the client details page
  viewDetails(client: Client): void {
    this.router.navigate(['/admin/clients/details', client.id]);
  }
}
