import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Voiture } from '../vehicle.model';
import { VehicleService } from '../vehicle.service';
import * as XLSX from 'xlsx';

type SortableColumn = keyof Voiture | '';

@Component({
  selector: 'app-vehicles-list',
  standalone: false,
  templateUrl: './vehicles-list.component.html',
  styleUrls: ['./vehicles-list.component.css']
})
export class VehiclesListComponent implements OnInit {
  isLoading = false;
  allVoitures: Voiture[] = [];
  voitures: Voiture[] = [];
  paginatedVoitures: Voiture[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  sortColumn: SortableColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  public Math = Math;

  vehiclePhotoUrls: { [id: number]: SafeUrl } = {};

  constructor(
    private vehicleService: VehicleService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadVoitures();
  }

  loadVoitures(): void {
    this.isLoading = true;
    this.vehicleService.getVehicles().subscribe({
      next: (data) => {
        this.allVoitures = data;
        this.applyFiltersAndSort();
        this.loadVehiclePhotos();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.isLoading = false;
      }
    });
  }

  loadVehiclePhotos(): void {
    this.allVoitures.forEach(vehicle => {
      if (vehicle.id) {
        this.vehicleService.getVehiclePhoto(vehicle.id).subscribe({
          next: (blob) => {
            const objectUrl = URL.createObjectURL(blob);
            this.vehiclePhotoUrls[vehicle.id] = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
          },
          error: (error) => {
            console.error(`Error loading photo for vehicle ${vehicle.id}:`, error);
          }
        });
      }
    });
  }

  getVehiclePhotoUrl(id: number): SafeUrl | null {
    return this.vehiclePhotoUrls[id] || null;
  }

  applyFiltersAndSort(): void {
    let processedData = [...this.allVoitures];

    if (this.searchTerm) {
      const lowerSearchTerm = this.searchTerm.toLowerCase();
      processedData = processedData.filter(voiture =>
        Object.values(voiture).some(val =>
          val !== null && val !== undefined &&
          val.toString().toLowerCase().includes(lowerSearchTerm)
        )
      );
    }

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

    this.voitures = processedData;
    this.currentPage = 1;
    this.updatePagination();
  }

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
    this.totalPages = Math.ceil(this.voitures.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
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

  exportToExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(this.voitures);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vehicles");
    XLSX.writeFile(workbook, "vehicles_export.xlsx");
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
    if (confirm(`Are you sure you want to delete ${voiture.marque} ${voiture.modele} (ID: ${voiture.id})?`)) {
      this.vehicleService.deleteVehicle(voiture.id).subscribe({
        next: () => {
          this.allVoitures = this.allVoitures.filter(v => v.id !== voiture.id);
          this.applyFiltersAndSort();
        },
        error: (error) => {
          console.error('Error deleting vehicle:', error);
        }
      });
    }
  }

  ngOnDestroy(): void {
    Object.values(this.vehiclePhotoUrls).forEach(url => {
      if (url) {
        URL.revokeObjectURL(url.toString());
      }
    });
  }
}
