import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Voiture } from '../vehicle.model'; // Update the import if needed
import { VehicleService } from '../vehicle.service'; // Update the import if needed
import * as XLSX from 'xlsx';

// Define the possible sortable columns using the keys of the Voiture model
type SortableColumn = keyof Voiture | ''; // Allow empty string for no sort

@Component({
  selector: 'app-vehicles-list',
  standalone: false, // Keep as needed for your project structure
  templateUrl: './vehicles-list.component.html',
  styleUrls: ['./vehicles-list.component.css']
})
export class VehiclesListComponent implements OnInit {
  isLoading = false;

  allVoitures: Voiture[] = []; // Holds the original unfiltered list
  voitures: Voiture[] = [];     // Holds the currently displayed list (filtered and sorted)
  paginatedVoitures: Voiture[] = []; // Holds the data for the current page

  searchTerm: string = '';

  // Pagination settings
  currentPage: number = 1;
  itemsPerPage: number = 5; // Or your desired items per page
  totalPages: number = 1;

  // Sorting settings
  sortColumn: SortableColumn = ''; // Column currently sorted by
  sortDirection: 'asc' | 'desc' = 'asc'; // Sort direction
  public Math = Math;

  constructor(private vehicleService: VehicleService, private router: Router) {}

  ngOnInit(): void {
    this.loadVoitures();
  }

  loadVoitures(): void {
    this.vehicleService.getVehicles().subscribe(data => {
      this.allVoitures = data; // Store the original data
      // Initialize the displayed list (apply initial filter/sort if needed)
      this.applyFiltersAndSort();
    });
  }

  // Combined function to handle filtering and sorting
  applyFiltersAndSort(): void {
    // 1. Start with the original data
    let processedData = [...this.allVoitures];

    // 2. Apply Search Filter
    if (this.searchTerm) {
      const lowerSearchTerm = this.searchTerm.toLowerCase();
      processedData = processedData.filter(voiture =>
        Object.values(voiture).some(val => // Search across all string/number values
          val !== null && val !== undefined &&
          val.toString().toLowerCase().includes(lowerSearchTerm)
        )
        // Or be more specific:
        // voiture.marque?.toLowerCase().includes(lowerSearchTerm) ||
        // voiture.modele?.toLowerCase().includes(lowerSearchTerm) ||
        // voiture.matricule?.toLowerCase().includes(lowerSearchTerm) ||
        // voiture.type?.toLowerCase().includes(lowerSearchTerm) ||
        // voiture.id?.toString().includes(lowerSearchTerm) || // Search by ID
        // voiture.prixDeBase?.toString().includes(lowerSearchTerm) // Search by price
      );
    }

    // 3. Apply Sorting
    if (this.sortColumn) {
       // Use ! because we check this.sortColumn is truthy
       const column = this.sortColumn!;
       processedData.sort((a, b) => {
         const valA = a[column];
         const valB = b[column];

         let comparison = 0;

         // Basic comparison - adjust if specific type handling (numbers, dates) is needed
         if (valA === null || valA === undefined) comparison = -1;
         else if (valB === null || valB === undefined) comparison = 1;
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
    this.voitures = processedData;
    this.currentPage = 1; // Reset to first page after filtering/sorting
    this.updatePagination();
  }

  // --- Search ---
  // Renamed from filterVoitures to avoid confusion, now calls the combined function
  onSearchInput(): void {
    this.applyFiltersAndSort();
  }

  // --- Sorting ---
  sortTable(column: SortableColumn): void {
    if (!column) return; // Should not happen with current HTML but good practice

    if (this.sortColumn === column) {
      // Toggle direction if same column is clicked
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Change column and reset direction
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort(); // Re-apply filters and sort
  }

  // Helper for sort icons in the template
  getSortIcon(column: SortableColumn): string {
    if (this.sortColumn !== column) {
      return 'fa-sort'; // Default icon (neutral)
    }
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  // --- Pagination ---
  updatePagination(): void {
    // Paginate the *filtered and sorted* list
    this.totalPages = Math.ceil(this.voitures.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = this.totalPages; // Go to last page if current page is invalid
    } else if (this.totalPages === 0) {
        this.currentPage = 1; // Reset to 1 if no results
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedVoitures = this.voitures.slice(startIndex, startIndex + this.itemsPerPage);
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
    if (this.totalPages === 0) return pages; // No pages if no data

    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    // Adjust startPage if endPage reaches the maximum limit
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
    const worksheet = XLSX.utils.json_to_sheet(this.voitures);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Voitures");
    XLSX.writeFile(workbook, "voitures_export.xlsx"); // Changed filename slightly
  }

  createVoiture(): void {
    this.router.navigate(['admin/vehicles/create']);
  }

  viewDetails(voiture: Voiture): void {
    this.router.navigate(['/admin/vehicles/details', voiture.id]);
  }

  editVoiture(voiture: Voiture): void {
    this.router.navigate(['admin/vehicles/edit', voiture.id]);
  }

  deleteVoiture(voiture: Voiture): void {
    // Consider using a confirmation dialog library (like SweetAlert) for better UX
    if (confirm(`Are you sure you want to delete ${voiture.marque} ${voiture.modele} (ID: ${voiture.id})?`)) {
      this.vehicleService.deleteVehicle(voiture.id).subscribe({
        next: () => {
          console.log('Vehicle deleted successfully');
          // Remove from both lists to avoid needing a full reload from server
          this.allVoitures = this.allVoitures.filter(v => v.id !== voiture.id);
          this.applyFiltersAndSort(); // Re-apply filter/sort and update pagination
          // Optionally show a success message to the user
        },
        error: (error) => {
          console.error('Error deleting vehicle:', error);
          // Optionally show an error message to the user
        }
      });
    }
  }
}
