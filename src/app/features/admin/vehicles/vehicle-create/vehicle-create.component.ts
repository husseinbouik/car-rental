import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { VehicleService } from './../vehicle.service'; // Corrected path
import { Voiture } from '../vehicle.model';         // Ensure path is correct

@Component({
  selector: 'app-vehicle-create',
  standalone: false, // Or true if using standalone
  templateUrl: './vehicle-create.component.html',
  styleUrls: ['./vehicle-create.component.css']
})
export class VehicleCreateComponent implements OnInit {

  // Initialize voiture with default/empty values
  voiture: Voiture = {
    id: 0, // Or null depending on backend expectation for create
    marque: '',
    modele: '',
    matricule: '',
    type: '',
    prixDeBase: 0, // Use null or undefined if 0 is a valid price to avoid confusion
    capacite: 0,   // Use null or undefined?
    carburant: '',
    couleur: '',
    estAutomate: false,
    vname: ''
    // photoPath: '' // Add if you have photo uploads
  };

  isEditMode = false;
  isLoading = false;
  errorMessage: string | null = null;
  pageTitle = 'Create New Vehicle'; // Dynamic title
  submitButtonText = 'Create Vehicle'; // Dynamic button text
  vehicleId: number | null = null; // Store ID for editing

  // Options for dropdowns if needed (e.g., for 'type' or 'carburant')
  // fuelTypes: string[] = ['Essence', 'Diesel', 'Electric', 'Hybrid'];
  // vehicleTypes: string[] = ['Berline', 'SUV', 'Hatchback', 'Convertible', 'Truck'];

  constructor(
    private vehicleService: VehicleService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isLoading = true; // Start loading indicator
    this.errorMessage = null;
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.vehicleId = +idParam;
      if (!isNaN(this.vehicleId)) {
        // --- Edit Mode ---
        this.isEditMode = true;
        this.pageTitle = 'Edit Vehicle';
        this.submitButtonText = 'Save Changes';
        this.loadVehicleData(this.vehicleId); // Fetch existing data
      } else {
        // Invalid ID parameter
        this.errorMessage = `Invalid Vehicle ID provided in URL: ${idParam}`;
        this.isLoading = false; // Stop loading
      }
    } else {
      // --- Create Mode ---
      this.isEditMode = false;
      this.pageTitle = 'Create New Vehicle';
      this.submitButtonText = 'Create Vehicle';
      // Initialize numeric fields that might cause issues with required validation if 0
      this.voiture.prixDeBase = null as any; // Or undefined
      this.voiture.capacite = null as any;   // Or undefined
      this.isLoading = false; // No data to load
    }
  }

  /**
   * Fetches vehicle data for editing.
   */
  loadVehicleData(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.vehicleService.getVehicleById(id)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.voiture = data;
            console.log("Loaded vehicle data:", this.voiture);
          } else {
            this.errorMessage = `Vehicle with ID ${id} not found.`;
          }
        },
        error: (err) => {
          console.error('Error fetching vehicle:', err);
          this.errorMessage = `Failed to load vehicle data (ID: ${id}). Please try again.`;
        }
      });
  }

  /**
   * Handles form submission for creating or updating a vehicle.
   */
  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Ensure numeric values are numbers if they were potentially null/undefined
    const vehicleDataToSend: Voiture = {
        ...this.voiture,
        prixDeBase: Number(this.voiture.prixDeBase ?? 0),
        capacite: Number(this.voiture.capacite ?? 0),
    };

    const operation = this.isEditMode
      ? this.vehicleService.updateVehicle(vehicleDataToSend) // Ensure service method takes Voiture object
      : this.vehicleService.createVehicle(vehicleDataToSend);

    operation
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          console.log(`Vehicle ${this.isEditMode ? 'updated' : 'created'} successfully`, response);
          this.router.navigate(['/admin/vehicles'], { // Adjust route
            state: { successMessage: `Vehicle ${this.isEditMode ? 'updated' : 'created'} successfully!` }
          });
        },
        error: (err: HttpErrorResponse) => {
          console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} vehicle:`, err);
          if (err.error && typeof err.error === 'string' && err.status !== 500) {
               this.errorMessage = err.error;
           } else if (err.error && err.error.message) {
               this.errorMessage = err.error.message;
           } else {
               this.errorMessage = `Failed to ${this.isEditMode ? 'update' : 'create'} vehicle. Status: ${err.status} - ${err.statusText || 'Unknown error'}.`;
           }
           // Add specific error checks if needed (e.g., matricule already exists)
           // if (this.errorMessage?.includes('constraint violation')) {
           //     this.errorMessage = "Failed to save: A vehicle with this license plate (matricule) might already exist.";
           // }
        }
      });
  }

  /**
   * Navigates back to the vehicle list.
   */
  cancel(): void {
    this.router.navigate(['/admin/vehicles']); // Adjust route
  }
}
