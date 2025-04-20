import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators'; // Import finalize
import { VehicleService } from './../vehicle.service';
import { Voiture } from '../vehicle.model'; // Ensure path is correct

@Component({
  selector: 'app-vehicle-details',
  standalone: false,
  templateUrl: './vehicle-details.component.html',
  styleUrls: ['./vehicle-details.component.css'] // Corrected property name from styleUrl
})
export class VehicleDetailsComponent implements OnInit {
  voiture: Voiture | undefined;
  isLoading = false;
  errorMessage: string | null = null;
  vehicleId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService
  ) {}
  // Other properties and methods...
  ngOnInit(): void {
    this.isLoading = true; // Start loading
    this.errorMessage = null;
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.vehicleId = +idParam; // Convert param to number
      if (!isNaN(this.vehicleId)) {
        this.loadVehicleDetails(this.vehicleId);
      } else {
        this.errorMessage = `Invalid Vehicle ID provided: ${idParam}`;
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'No Vehicle ID provided in the route.';
      this.isLoading = false;
    }
  }

  // Fetch vehicle details by ID
  loadVehicleDetails(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.vehicleService.getVehicleById(id)
      .pipe(
        finalize(() => this.isLoading = false) // Ensure loading stops
      )
      .subscribe({
        next: (vehicleData) => {
          console.log("Fetched vehicle details:", vehicleData);
          this.voiture = vehicleData;
          if (!this.voiture) {
             this.errorMessage = `Vehicle with ID ${id} not found.`;
          }
        },
        error: (error) => {
          console.error('Error fetching vehicle details:', error);
          this.errorMessage = `Failed to load vehicle details for ID ${id}. Please try again later.`;
          this.voiture = undefined;
        }
      });
  }

  // Navigate back to the vehicles list
  goBack(): void {
    // Consider previous navigation state or default to list
    this.router.navigate(['/admin/vehicles']); // Adjust route if necessary
  }

  // Navigate to the edit page for this vehicle
  goToEdit(): void {
    if (this.voiture?.id) {
      this.router.navigate(['/admin/vehicles/edit', this.voiture.id]); // Adjust route
    }
  }
}
