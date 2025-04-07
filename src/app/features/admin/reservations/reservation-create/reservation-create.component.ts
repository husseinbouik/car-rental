// src/app/features/reservations/reservation-create/reservation-create.component.ts

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { ReservationService } from '../reservation.service';
import { ClientService } from '../../clients/client.service';     // Adjust path as needed
import { VehicleService } from '../../vehicles/vehicle.service';   // Adjust path as needed
import { Reservation } from '../reservation.model';             // Adjust path as needed

// Define simple interfaces for dropdown options
interface ClientOption {
  id: number | null; // Allow null for the "None" option
  display_name: string;
}
interface CarOption {
  id: number;
  display_name: string;
}

@Component({
  selector: 'app-reservation-create',
  standalone: false, // Or true if using standalone components
  templateUrl: './reservation-create.component.html',
  styleUrls: ['./reservation-create.component.css']
})
export class ReservationCreateComponent implements OnInit {

  // Form model: Using Partial<Reservation> for flexibility during creation/edit
  reservation: Partial<Reservation> = {
    id: null,
    acompte: 0,
    dateDebut: this.formatDateForInput(new Date()), // Default start: now
    // Default end: 1 day from now
    dateFin: this.formatDateForInput(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    montantTotal: 0,
    statut: 'Pending', // Default status
    client_id: undefined, // Use undefined initially for required select validation
    voiture_id: undefined, // Use undefined initially for required select validation
    conducteur_secondaire_id: null // Initialize optional field as null
  };

  // Arrays to hold dropdown options
  clients: ClientOption[] = [];
  cars: CarOption[] = [];
  secondaryDriverOptions: ClientOption[] = [];

  // Component state flags and properties
  isLoading = true; // Start in loading state
  errorMessage: string | null = null;
  isEditMode = false;
  reservationId: number | null = null; // Store the ID being edited
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
    this.isLoading = true; // Ensure loading state is active
    this.errorMessage = null; // Clear any previous errors

    // Check route parameters to determine if we are in edit mode
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
        // Attempt to convert parameter to number
        this.reservationId = +idParam;
        if (!isNaN(this.reservationId)) {
            // Valid number ID found - enter edit mode
            this.isEditMode = true;
            this.pageTitle = 'Edit Reservation';
            this.submitButtonText = 'Update Reservation';
        } else {
             // Invalid ID parameter in URL
             console.error("Invalid ID parameter in URL:", idParam);
             this.errorMessage = "Invalid reservation ID provided in the URL.";
             this.isLoading = false; // Stop loading as we cannot proceed
             return; // Exit ngOnInit early
        }
    } else {
        // No ID parameter - we are in create mode
        this.isEditMode = false;
        this.pageTitle = 'Create New Reservation';
        this.submitButtonText = 'Create Reservation';
    }

    // Start the process: Load dropdown options first, then reservation data if editing
    this.loadPrerequisitesAndReservation();
  }

  /**
   * Loads prerequisite data (clients, cars) using forkJoin.
   * Once prerequisites are loaded, it calls loadReservationData if in edit mode.
   */
  loadPrerequisitesAndReservation(): void {
    this.isLoading = true; // Ensure loading state
    forkJoin({
      // Fetch clients, handle potential errors
      clients: this.clientService.getClients().pipe(
        catchError(err => {
          console.error('Error loading clients:', err);
          this.errorMessage = 'Failed to load the client list. Please try again later.';
          return of([]); // Return empty array on error to allow the process to potentially continue
        })
      ),
      // Fetch vehicles, handle potential errors
      cars: this.vehicleService.getVehicles().pipe(
        catchError(err => {
          console.error('Error loading cars:', err);
          // Append to existing error message if necessary
          this.errorMessage = (this.errorMessage ? this.errorMessage + ' ' : '') + 'Failed to load the car list. Please try again later.';
          return of([]); // Return empty array on error
        })
      )
    })
    .pipe(
        // finalize ensures isLoading is handled correctly whether forkJoin succeeds or errors occur
        finalize(() => {
             // If not in edit mode, loading is finished after prerequisites are loaded (or failed)
             if (!this.isEditMode) {
                 this.isLoading = false;
             }
             // If in edit mode, isLoading will be set to false inside loadReservationData's finalize block
         })
    )
    .subscribe(({ clients, cars }) => {
      // --- Process successfully fetched clients ---
      this.clients = clients.map(client => ({
        id: Number(client.id), // Ensure ID is a number
        // Construct display name using available fields (adjust based on your Client model/DTO)
        display_name: `${client.cname || ''}`.trim()
      }));

      // --- Process successfully fetched cars ---
      this.cars = cars.map(car => ({
        id: Number(car.id), // Ensure ID is a number
        // Construct display name using available fields (adjust based on your Voiture model/DTO)
        display_name: `${car.marque || ''} ${car.modele || car.vname || ''} (${car.matricule || 'N/A'})`.trim()
      }));

      // --- Setup secondary driver options (includes a "None" option) ---
      this.secondaryDriverOptions = [
          { id: null, display_name: 'None / Not Applicable' }, // Use null value for the "None" selection
          ...this.clients // Reuse the mapped client list
      ];

      // --- Proceed to load reservation details ONLY if in edit mode AND prerequisites loaded successfully ---
      if (this.isEditMode && this.reservationId) {
        // Check if prerequisite loading encountered errors
        if (this.errorMessage && (this.errorMessage.includes('client list') || this.errorMessage.includes('car list'))) {
            // Don't try to load reservation if prerequisites failed
            this.isLoading = false; // Stop loading indicator
            console.warn("Cannot load reservation details because client/car list failed to load.");
            // The error message is already displayed
            return;
        }
        // Prerequisites loaded, now fetch the specific reservation
        this.loadReservationData(this.reservationId);
      }
      // If not in edit mode, loading was already set to false in finalize
    });
}

  /**
   * Fetches the reservation data for the given ID (used in edit mode).
   * Extracts IDs from nested client/voiture objects received from the API.
   * Populates the `this.reservation` form model.
   * @param id The ID of the reservation to load.
   */
  loadReservationData(id: number): void {
    this.isLoading = true; // Ensure loading state
    this.reservationService.getReservationById(id).pipe(
        finalize(() => this.isLoading = false) // Stop loading indicator when API call completes or errors
    ).subscribe({
      next: (data) => {
        console.log('API response for getReservationById:', data); // Log raw API response

        // Safely extract IDs from nested objects using optional chaining
        const clientId = data.client?.id;
        const voitureId = data.voiture?.id;
        // If data.conducteurSecondaire is null, accessing its id will result in undefined
        const conducteurSecondaireId = data.conducteurSecondaire?.id;

        console.log(`Extracted IDs - Client: ${clientId}, Voiture: ${voitureId}, Secondary: ${conducteurSecondaireId}`);

        // Populate the component's reservation object for form binding
        this.reservation = {
          // Spread other properties from the fetched data (like acompte, montantTotal, dates etc.)
          ...data,
          id: Number(data.id), // Ensure the main reservation ID is a number

          // Format dates received from backend (assuming ISO strings) for the datetime-local input
          dateDebut: this.formatDateForInput(data.dateDebut),
          dateFin: this.formatDateForInput(data.dateFin),

          // *** Crucially, assign the EXTRACTED IDs to the properties bound by ngModel ***
          client_id: clientId != null ? Number(clientId) : undefined, // Convert to number or use undefined if null/missing
          voiture_id: voitureId != null ? Number(voitureId) : undefined, // Convert to number or use undefined if null/missing

          // Assign secondary driver ID: convert to number if present, otherwise explicitly use null
          conducteur_secondaire_id: conducteurSecondaireId != null ? Number(conducteurSecondaireId) : null,

          // Ensure other numeric fields are numbers
          acompte: Number(data.acompte ?? 0),
          montantTotal: Number(data.montantTotal ?? 0),
          // Keep status as is
          statut: data.statut
        };

        console.log('Populated this.reservation for form binding:', this.reservation);
        // At this point, Angular's change detection should bind the numeric IDs
        // to the select elements, matching the [ngValue] of the options loaded earlier.
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading reservation details:', err);
        this.errorMessage = `Failed to load reservation data (ID: ${id}). The record might not exist or there was a server error.`;
        // isLoading is set to false via the finalize operator
      }
    });
  }

  /**
   * Formats a Date object or ISO string into the 'yyyy-MM-ddTHH:mm' format
   * required by the datetime-local input type.
   * @param dateValue The date value to format.
   * @returns The formatted date string or an empty string if input is invalid.
   */
  formatDateForInput(dateValue: string | Date | null | undefined): string {
    if (!dateValue) return '';
    try {
      const date = new Date(dateValue);
      // Check if the date is valid after parsing
      if (isNaN(date.getTime())) {
          console.warn("Invalid date value received for formatting:", dateValue);
          return '';
      }
      // Use Angular's formatDate for reliable formatting
      return formatDate(date, 'yyyy-MM-ddTHH:mm', 'en-US'); // Using 'en-US' locale for consistency
    } catch (e) {
      console.error("Error formatting date:", dateValue, e);
      return ''; // Return empty string on any formatting error
    }
  }

  /**
   * Handles the form submission for creating or updating a reservation.
   * Performs validation, prepares the payload, and calls the appropriate service method.
   */
  onSubmit(): void {
    if (this.isLoading) return; // Prevent multiple submissions
    this.errorMessage = null; // Clear previous errors at the start of submission attempt

    // --- Perform Frontend Validations ---
    if (this.reservation.client_id === undefined || this.reservation.voiture_id === undefined) {
      this.errorMessage = 'Please select both a client and a car.';
      return;
    }
    if (!this.reservation.dateDebut || !this.reservation.dateFin) {
        this.errorMessage = 'Please provide both start and end dates/times.';
        return;
    }
    // Check if secondary driver is the same as the primary client (only if a secondary driver is selected)
    if (this.reservation.conducteur_secondaire_id !== null && this.reservation.conducteur_secondaire_id === this.reservation.client_id) {
        this.errorMessage = 'The secondary driver cannot be the same as the primary client.';
        return;
    }

    let startDate: Date;
    let endDate: Date;
    try {
        // Parse dates from the input fields
        startDate = new Date(this.reservation.dateDebut);
        endDate = new Date(this.reservation.dateFin);
        // Check if parsing resulted in valid dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error('Invalid date format encountered during parsing.');
        }
    } catch(e) {
        this.errorMessage = 'Invalid date format. Please ensure dates and times are entered correctly.';
        console.error("Date parsing error on submit", e);
        return;
    }

    // Validate date order
    if (startDate >= endDate) {
      this.errorMessage = 'The reservation end date and time must be strictly after the start date and time.';
      return;
    }
    // --- End Frontend Validations ---

    this.isLoading = true; // Set loading state for submission

    // --- Prepare the payload object to send to the backend API ---
    // This payload should match what the backend expects (likely IDs for relationships)
    const payload: any = {
        // Spread the current reservation form values
        ...this.reservation,
        // Convert dates back to ISO 8601 format strings, which Spring Boot @RequestBody can handle for LocalDateTime
        dateDebut: startDate.toISOString(),
        dateFin: endDate.toISOString(),
        // Ensure numeric fields are numbers (even if potentially 0)
        acompte: Number(this.reservation.acompte ?? 0),
        montantTotal: Number(this.reservation.montantTotal ?? 0),
        // Ensure IDs are numbers
        client_id: Number(this.reservation.client_id),
        voiture_id: Number(this.reservation.voiture_id),
        // Send secondary driver ID as number if selected, otherwise explicitly send null
        conducteur_secondaire_id: this.reservation.conducteur_secondaire_id != null ? Number(this.reservation.conducteur_secondaire_id) : null,
    };

    // Adjust payload based on create vs update
    if (!this.isEditMode) {
        // For CREATE operations, the backend usually assigns the ID, so we don't send it.
        delete payload.id;
    } else if (this.reservationId) {
        // For UPDATE operations, ensure the correct ID (from the route parameter) is included.
        payload.id = this.reservationId;
    } else {
        // Safety check: Should not be able to reach here in edit mode without a valid ID
        console.error("Critical Error: Attempting to update reservation without a valid ID.");
        this.errorMessage = "Cannot update reservation: The reservation ID is missing.";
        this.isLoading = false; // Stop loading
        return;
    }

    console.log("Payload being sent to API:", payload); // Log payload for debugging

    // Determine the correct service method to call
    const operation = this.isEditMode
      ? this.reservationService.updateReservation(this.reservationId!, payload) // Use the ID from route params
      : this.reservationService.createReservation(payload);

    // Execute the API call
    operation.pipe(
        finalize(() => this.isLoading = false) // Ensure loading state is turned off after completion or error
    ).subscribe({
      next: (response) => {
        console.log(`Reservation successfully ${this.isEditMode ? 'updated' : 'created'}:`, response);
        // Navigate back to the list view with a success message state
        this.router.navigate(['/admin/reservations'], { // Adjust route as necessary
          state: {
            successMessage: `Reservation ${this.isEditMode ? 'updated' : 'created'} successfully!`
          }
        });
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error saving reservation:', err);
        // Try to extract a meaningful error message from the response
        if (err.error && typeof err.error === 'string' && err.status !== 500) {
            // Use backend string error directly if available and not a generic 500
            this.errorMessage = err.error;
        } else if (err.error && err.error.message) {
            // Check for standard { message: '...' } structure
            this.errorMessage = err.error.message;
        } else if (err.message) {
            // Fallback to HttpErrorResponse message
             this.errorMessage = `API Error (${err.status}): ${err.statusText || 'An unknown error occurred.'}`;
        } else {
            this.errorMessage = `Failed to ${this.isEditMode ? 'update' : 'create'} reservation. Please check the details and try again.`;
        }

        // Handle specific known backend validation errors if possible
        if (this.errorMessage && this.errorMessage.includes("antérieures")) { // Example check for date validation error text
            this.errorMessage = "Validation Error: The end date cannot be before the start date.";
        }
        // isLoading is set to false via the finalize operator
      }
    });
  }

  /**
   * Navigates the user back to the reservation list view.
   */
  cancel(): void {
    this.router.navigate(['/admin/reservations']); // Adjust route as necessary
  }
}
