import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Voiture } from '../vehicle.model'; // Update the import
import { VehicleService } from '../vehicle.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-vehicles-list',
  standalone:false,
  templateUrl: './vehicles-list.component.html',
  styleUrls: ['./vehicles-list.component.css']
})
export class VehiclesListComponent implements OnInit {
  voitures: Voiture[] = []; // Update the type to Voiture
  paginatedVoitures: Voiture[] = []; // Update the type to Voiture
  searchTerm: string = '';

  // Pagination settings
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  constructor(private vehicleService: VehicleService, private router: Router) {}

  ngOnInit(): void {
    this.loadVoitures(); // Update the method name
  }

  loadVoitures(): void { // Update the method name
    this.vehicleService.getVehicles().subscribe(voitures => {
      this.voitures = voitures;
      this.updatePagination();
    });
  }

  filterVoitures(): void { // Update the method name
    const filtered = this.voitures.filter(voiture =>
      voiture.marque?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      voiture.modele?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      voiture.type?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    this.voitures = this.searchTerm ? filtered : this.voitures;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.voitures.length / this.itemsPerPage);
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
    const worksheet = XLSX.utils.json_to_sheet(this.voitures);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Voitures");
    XLSX.writeFile(workbook, "voitures.xlsx");
  }

  // Navigate to the create vehicle page
  createVoiture(): void { // Update the method name
    this.router.navigate(['admin/vehicles/create']);
  }
  viewDetails(voiture: Voiture): void {
    this.router.navigate(['/admin/vehicles/details', voiture.id]);
  }
  // Navigate to the edit vehicle page
  editVoiture(voiture: Voiture): void { // Update the method name
    this.router.navigate(['admin/vehicles/edit', voiture.id]);
  }

  // Delete a vehicle
  deleteVoiture(voiture: Voiture): void { // Update the method name
    if (confirm('Are you sure you want to delete this vehicle?')) {
      this.vehicleService.deleteVehicle(voiture.id).subscribe({
        next: () => {
          console.log('Vehicle deleted successfully');
          this.loadVoitures(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting vehicle:', error);
        }
      });
    }
  }
}
