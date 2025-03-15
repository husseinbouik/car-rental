import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Vehicle } from '../vehicle.model';
import { VehicleService } from '../vehicle.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-vehicles-list',
  standalone: false,
  templateUrl: './vehicles-list.component.html',
  styleUrls: ['./vehicles-list.component.css']
})
export class VehiclesListComponent implements OnInit {
  vehicles: Vehicle[] = [];
  paginatedVehicles: Vehicle[] = [];
  searchTerm: string = '';

  // Pagination settings
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  constructor(private vehicleService: VehicleService, private router: Router) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe(vehicles => {
      this.vehicles = vehicles;
      this.updatePagination();
    });
  }

  filterVehicles(): void {
    const filtered = this.vehicles.filter(vehicle =>
      vehicle.make.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    this.vehicles = this.searchTerm ? filtered : this.vehicles;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.vehicles.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedVehicles = this.vehicles.slice(startIndex, startIndex + this.itemsPerPage);
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
    const maxVisiblePages = 5; // Number of visible page buttons

    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  exportToExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(this.vehicles);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vehicles");
    XLSX.writeFile(workbook, "vehicles.xlsx");
  }

  // Navigate to the create vehicle page
  createVehicle(): void {
    this.router.navigate(['admin/vehicles/create']);
  }

  // Navigate to the edit vehicle page
  editVehicle(vehicle: Vehicle): void {
    this.router.navigate(['admin/vehicles/edit', vehicle.id]);
  }

  // Delete a vehicle
  deleteVehicle(vehicle: Vehicle): void {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      this.vehicleService.deleteVehicle(vehicle.id).subscribe({
        next: () => {
          console.log('Vehicle deleted successfully');
          this.loadVehicles(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting vehicle:', error);
        }
      });
    }
  }
}
