import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ReservationService } from '../reservation.service';
import { ClientService } from '../../clients/client.service';
import { VehicleService } from '../../vehicles/vehicle.service';
import { Reservation } from '../reservation.model';

interface ClientOption {
  id: number | null;
  display_name: string;
}

interface CarOption {
  id: number;
  display_name: string;
  matricule?: string;
  type?: string;
  daily_rate?: number;
  photoUrl?: string;
  isLoadingPhoto?: boolean;
  photoError?: boolean;
}

@Component({
  selector: 'app-reservation-create',
  standalone: false,
  templateUrl: './reservation-create.component.html',
  styleUrls: ['./reservation-create.component.css']
})
export class ReservationCreateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
// Add this with other class properties
private dateChangeSubject = new Subject<void>();
  // Form model
  reservation: Partial<Reservation> = {
    id: null,
    acompte: 0,
    dateDebut: this.formatDateForInput(new Date()),
    dateFin: this.formatDateForInput(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    montantTotal: 0,
    statut: 'Pending',
    client_id: undefined,
    voiture_id: undefined,
    conducteur_secondaire_id: null
  };

  // Component state
  currentStep = 1;
  minStartDate = this.formatDateForInput(new Date());
  clients: ClientOption[] = [];
  cars: CarOption[] = [];
  selectedVehicle: CarOption | null = null;
  secondaryDriverOptions: ClientOption[] = [];

  // Loading states
  isLoading = true;
  isLoadingAvailableVehicles = false;
  isSubmitting = false;

  // Error states
  errorMessage: string | null = null;
  availableVehicleError: string | null = null;

  // Edit mode
  isEditMode = false;
  reservationId: number | null = null;
  pageTitle = 'Create New Reservation';
  submitButtonText = 'Create Reservation';

  constructor(
    private reservationService: ReservationService,
    private clientService: ClientService,
    private vehicleService: VehicleService,
    private router: Router,
    private route: ActivatedRoute
  ) {}


ngOnInit(): void {
  this.isLoading = true;
  this.errorMessage = null;

  const idParam = this.route.snapshot.paramMap.get('id');
  if (idParam) {
    this.reservationId = +idParam;
    if (!isNaN(this.reservationId)) {
      this.isEditMode = true;
      this.pageTitle = 'Edit Reservation';
      this.submitButtonText = 'Update Reservation';
    } else {
      console.error("Invalid ID parameter in URL:", idParam);
      this.errorMessage = "Invalid reservation ID provided in the URL.";
      this.isLoading = false;
      return;
    }
  }

  // Set up date change subscription
  this.dateChangeSubject.pipe(
    takeUntil(this.destroy$),
    debounceTime(500),
    distinctUntilChanged()
  ).subscribe(() => {
    if (this.currentStep === 2) { // Only fetch if we're on the vehicle selection step
      this.fetchAvailableVehicles();
    }
  });

  this.loadClientsAndProceed();
}
ngOnDestroy(): void {
  // Clean up object URLs to prevent memory leaks
  this.cars.forEach(car => {
    if (car.photoUrl) {
      URL.revokeObjectURL(car.photoUrl);
    }
  });

  this.destroy$.next();
  this.destroy$.complete();
  this.dateChangeSubject.complete();
}

  loadClientsAndProceed(): void {
    this.clientService.getClients().pipe(
      catchError(err => {
        console.error('Error loading clients:', err);
        this.errorMessage = 'Failed to load the client list. Please try again later.';
        return of([]);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe(clients => {
      this.clients = clients.map(client => ({
        id: Number(client.id),
        display_name: `${client.cname || ''}`.trim()
      }));

      this.secondaryDriverOptions = [
        { id: null, display_name: 'None / Not Applicable' },
        ...this.clients
      ];

      if (this.isEditMode && this.reservationId) {
        this.loadReservationData(this.reservationId);
      } else {
        // Initial fetch of available vehicles with default dates
        this.fetchAvailableVehicles();
      }
    });
  }

  fetchAvailableVehicles(): void {
    if (!this.reservation.dateDebut || !this.reservation.dateFin) {
      this.availableVehicleError = "Please select both start and end dates first.";
      return;
    }

    const startDate = new Date(this.reservation.dateDebut);
    const endDate = new Date(this.reservation.dateFin);

    if (isNaN(startDate.getTime())) {
      this.availableVehicleError = "Invalid start date selected.";
      return;
    }

    if (isNaN(endDate.getTime())) {
      this.availableVehicleError = "Invalid end date selected.";
      return;
    }

    if (startDate >= endDate) {
      this.availableVehicleError = "End date must be after start date.";
      return;
    }

    this.isLoadingAvailableVehicles = true;
    this.availableVehicleError = null;

    this.vehicleService.getAvailableVehicles(this.reservation.dateDebut, this.reservation.dateFin).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoadingAvailableVehicles = false)
    ).subscribe({
      next: (vehicles) => {
        this.cars = vehicles.map(car => ({
          id: car.id,
          display_name: `${car.marque || ''} ${car.modele || car.vname || ''}`.trim(),
          matricule: car.matricule,
          type: car.type,
          daily_rate: car.prixDeBase,
          photoUrl: undefined,
          isLoadingPhoto: true,
          photoError: false
        }));

        // Load photos for each vehicle
        this.cars.forEach(car => {
          this.loadVehiclePhoto(car);
        });

        // If in edit mode and we have a selected vehicle, try to find it in the new list
        if (this.isEditMode && this.reservation.voiture_id) {
          const selectedCar = this.cars.find(c => c.id === this.reservation.voiture_id);
          if (selectedCar) {
            this.selectedVehicle = selectedCar;
          } else {
            this.availableVehicleError = "Warning: The originally selected vehicle is no longer available for these dates.";
          }
        }
      },
      error: (err) => {
        console.error('Error fetching available vehicles:', err);
        this.availableVehicleError = "Failed to check vehicle availability. Please try again.";
        this.cars = [];
      }
    });
  }

  validateDates(): void {
    if (!this.reservation.dateDebut || !this.reservation.dateFin) {
      this.errorMessage = "Please select both start and end dates.";
      return;
    }

    const startDate = new Date(this.reservation.dateDebut);
    const endDate = new Date(this.reservation.dateFin);

    if (startDate >= endDate) {
      this.errorMessage = "End date must be after start date.";
      return;
    }

    this.errorMessage = null;
    this.currentStep = 2;
    this.fetchAvailableVehicles();
  }

  selectVehicle(vehicleId: number): void {
    this.reservation.voiture_id = vehicleId;
    this.selectedVehicle = this.cars.find(c => c.id === vehicleId) || null;

    // Auto-calculate total amount if daily rate is available
    if (this.selectedVehicle?.daily_rate && this.reservation.dateDebut && this.reservation.dateFin) {
      const start = new Date(this.reservation.dateDebut);
      const end = new Date(this.reservation.dateFin);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      this.reservation.montantTotal = days * this.selectedVehicle.daily_rate;
    }
  }

  // ... (keep the existing loadReservationData, formatDateForInput, onSubmit, and cancel methods) ...


  /**
   * Fetches the reservation data for the given ID (used in edit mode).
   * Extracts IDs from nested client/voiture objects received from the API.
   * Populates the `this.reservation` form model.
   * @param id The ID of the reservation to load.
   */
  loadReservationData(id: number): void {
    // isLoading is already set by loadClientsAndProceed
    this.reservationService.getReservationById(id).pipe(
        finalize(() => this.isLoading = false) // Set overall loading to false when reservation data fetching finishes
    ).subscribe({
      next: (data) => {
        console.log('API response for getReservationById:', data);

        // Safely extract IDs from nested objects received from backend
        const clientId = data.client?.id;
        const voitureId = data.voiture?.id;
        const conducteurSecondaireId = data.conducteurSecondaire?.id;

        console.log(`Extracted IDs - Client: ${clientId}, Voiture: ${voitureId}, Secondary: ${conducteurSecondaireId}`);

        // Populate the component's reservation object for form binding
        this.reservation = {
          ...data, // Spread other properties
          id: Number(data.id),

          // Format dates received from backend (assuming ISO strings) for the datetime-local input
          dateDebut: this.formatDateForInput(data.dateDebut),
          dateFin: this.formatDateForInput(data.dateFin),

          // *** Assign the EXTRACTED IDs to the properties bound by ngModel ***
          // Ensure the assigned ID is present in the dropdown options loaded earlier (implicitly handled if API is correct)
          client_id: clientId != null ? Number(clientId) : undefined,
          voiture_id: voitureId != null ? Number(voitureId) : undefined,

          conducteur_secondaire_id: conducteurSecondaireId != null ? Number(conducteurSecondaireId) : null,

          acompte: Number(data.acompte ?? 0),
          montantTotal: Number(data.montantTotal ?? 0),
          statut: data.statut
        };

        console.log('Populated this.reservation for form binding:', this.reservation);
        // At this point, Angular's change detection should bind the numeric IDs
        // to the select elements, matching the [ngValue] of the options loaded earlier.
        // The fetchAvailableVehicles called after client loading will update the 'cars' list.
        // If the selected car in edit mode is NOT in the newly fetched 'cars' list,
        // the select input will show a blank option or the previously selected one visually,
        // but the ngModel will still hold the ID. You might add logic to handle this,
        // e.g., clearing voiture_id or showing a warning if the selected car is unavailable.
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading reservation details:', err);
        this.errorMessage = `Failed to load reservation data (ID: ${id}). The record might not exist or there was a server error.`;
        // isLoading is set to false via finalize
      }
    });
  }

  formatDateForInput(dateValue: string | Date | null | undefined): string {
    if (!dateValue) return '';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
          console.warn("Invalid date value received for formatting:", dateValue);
          return '';
      }
      return formatDate(date, 'yyyy-MM-ddTHH:mm', 'en-US');
    } catch (e) {
      console.error("Error formatting date:", dateValue, e);
      return '';
    }
  }

  /**
   * Triggers the fetch for available vehicles when the date inputs change.
   */
  onDateChange(): void {
      console.log("Date input value changed. Triggering debounced fetch.");
      // Push a value to the subject to trigger the debounced subscription
      // We don't need to pass the actual dates, as fetchAvailableVehicles reads from this.reservation
      this.dateChangeSubject.next();
  }


  onSubmit(): void {
    // ... (Frontend Validations remain the same, ensure they check this.reservation.dateDebut/dateFin) ...

    // --- Prepare the payload object to send to the backend API ---
    // This payload should match what the backend expects (ReservationRequestDTO)
    const payload: any = {
        // Spread the current reservation form values
        ...this.reservation,
        // Convert dates back to ISO 8601 format strings, which Spring Boot @RequestBody can handle for LocalDateTime
        dateDebut: new Date(this.reservation.dateDebut!).toISOString(), // Use non-null assertion after validation
        dateFin: new Date(this.reservation.dateFin!).toISOString(),   // Use non-null assertion after validation
        // Ensure numeric fields are numbers
        acompte: Number(this.reservation.acompte ?? 0),
        montantTotal: Number(this.reservation.montantTotal ?? 0),
        // Ensure IDs are numbers
        client_id: Number(this.reservation.client_id),
        voiture_id: Number(this.reservation.voiture_id),
        // Send secondary driver ID as number if selected, otherwise explicitly send null
        conducteur_secondaire_id: this.reservation.conducteur_secondaire_id != null ? Number(this.reservation.conducteur_secondaire_id) : null,
        // Include insurance option if it's part of your backend DTO/model and form
         // insuranceOption: this.reservation.insuranceOption // Example if you add this field
    };

    // Adjust payload based on create vs update (remains the same)
    if (!this.isEditMode) {
        delete payload.id;
    } else if (this.reservationId) {
        payload.id = this.reservationId;
    } else {
        console.error("Critical Error: Attempting to update reservation without a valid ID.");
        this.errorMessage = "Cannot update reservation: The reservation ID is missing.";
        this.isLoading = false;
        return;
    }

    console.log("Payload being sent to API:", payload);

    // Determine the correct service method to call (remains the same)
    const operation = this.isEditMode
      ? this.reservationService.updateReservation(this.reservationId!, payload)
      : this.reservationService.createReservation(payload);

    // Execute the API call (remains the same)
    operation.pipe(
        finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        console.log(`Reservation successfully ${this.isEditMode ? 'updated' : 'created'}:`, response);
        this.router.navigate(['/admin/reservations'], {
          state: {
            successMessage: `Reservation ${this.isEditMode ? 'updated' : 'created'} successfully!`
          }
        });
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error saving reservation:', err);
        if (err.error && typeof err.error === 'string' && err.status !== 500) {
            this.errorMessage = err.error;
        } else if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
        } else if (err.message) {
             this.errorMessage = `API Error (${err.status}): ${err.statusText || 'An unknown error occurred.'}`;
        } else {
            this.errorMessage = `Failed to ${this.isEditMode ? 'update' : 'create'} reservation. Please check the details and try again.`;
        }

        if (this.errorMessage && this.errorMessage.includes("antérieures")) {
            this.errorMessage = "Validation Error: The end date cannot be before the start date.";
        }
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/reservations']);
  }

  private loadVehiclePhoto(car: CarOption): void {
    car.isLoadingPhoto = true;
    car.photoError = false;

    this.vehicleService.getVehiclePhoto(car.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (blob: Blob) => {
        car.photoUrl = URL.createObjectURL(blob);
        car.isLoadingPhoto = false;
        car.photoError = false;
      },
      error: (error) => {
        console.error(`Error loading photo for vehicle ${car.id}:`, error);
        car.isLoadingPhoto = false;
        car.photoError = true;
      }
    });
  }
}
