import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Voiture } from '../../admin/vehicles/vehicle.model'; // Adjust path
import { VehicleService } from '../../admin/vehicles/vehicle.service'; // Adjust path
import { AuthService } from '../auth.service'; // Adjust path relative to vehicle-browser
import { ReservationService, CreateReservationPayload } from '../services/reservation.service'; // Adjust path
import { catchError, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';


interface RentalData {
  pickupDate: string;
  returnDate: string;
  insurance: string;
}

@Component({
  selector: 'app-vehicle-browser',
  standalone: false, // Or false if part of a module
  templateUrl: './vehicle-browser.component.html',
  styleUrls: ['./vehicle-browser.component.css']
})
export class VehicleBrowserComponent implements OnInit {

  // --- VEHICLE LISTING PROPERTIES ---
  vehicles: Voiture[] = [];
  filteredVehicles: Voiture[] = [];
  loadingVehicles = true;
  vehicleError: string | null = null;
  searchVehicleName: string = '';

  // --- RENTAL MODAL PROPERTIES ---
  showRentalModal = false;
  selectedVehicle: Voiture | null = null;
  rentalData: RentalData = { pickupDate: '', returnDate: '', insurance: 'basic' };
  isSubmittingRental = false;
  rentalSubmissionError: string | null = null;

  // --- AUTH MODAL PROPERTIES ---
  showAuthModal = false;
  public pendingRentalVehicle: Voiture | null = null; // Vehicle user tried to rent before auth check

  // --- SERVICE INJECTIONS ---
  constructor(
    private vehicleService: VehicleService,
    private authService: AuthService,
    private reservationService: ReservationService,
    private router: Router,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

// src/app/client/vehicle-browser/vehicle-browser.component.ts (Revised ngOnInit for Public Access)
ngOnInit(): void {
   console.log('VehicleBrowserComponent: ngOnInit started.');

   // --- No Authentication Check here if page is public ---
   // if (!this.authService.isLoggedIn()) { ... }

   if (isPlatformBrowser(this.platformId)) {
     console.log('VehicleBrowserComponent: Running in browser, fetching vehicles and initializing dates.');
     // fetchVehicles is called without auth check
     this.fetchVehicles();
     this.initRentalDates();
   } else {
      console.log('VehicleBrowserComponent: Not running in browser, skipping data fetch.');
      this.loadingVehicles = false;
   }
    console.log('VehicleBrowserComponent: ngOnInit finished.');
 }

  fetchVehicles(): void {
    console.log('VehicleBrowserComponent: fetchVehicles method called.');
    this.loadingVehicles = true;
    this.vehicleError = null;

    this.vehicleService.getVehicles().pipe(
      catchError(error => {
        console.error('VehicleBrowserComponent: Error fetching vehicles in catchError:', error);
        // Log specific error details if available
        if (error instanceof HttpErrorResponse) {
            console.error('VehicleBrowserComponent: HTTP Status:', error.status);
            console.error('VehicleBrowserComponent: HTTP Body:', error.error);
        }
        this.vehicleError = this.translate.instant('vehicles.error_fetching'); // Add this key to your translations
        this.loadingVehicles = false;
        console.log('VehicleBrowserComponent: Setting vehicles and filteredVehicles to empty array after error.');
        return of([]); // Return an empty observable array on error
      })
    ).subscribe({
       next: (data: Voiture[]) => {
          console.log('VehicleBrowserComponent: fetchVehicles subscribe next callback reached.');
          console.log('VehicleBrowserComponent: Received data:', data);
          this.vehicles = data;
          this.filteredVehicles = [...this.vehicles]; // Show all initially
          console.log('VehicleBrowserComponent: vehicles array updated:', this.vehicles);
          console.log('VehicleBrowserComponent: filteredVehicles array updated:', this.filteredVehicles);
       },
       error: (err) => {
          // This error callback is typically redundant if catchError is used correctly,
          // but including for completeness. catchError handles the error stream.
          console.error('VehicleBrowserComponent: fetchVehicles subscribe error callback reached (should be handled by catchError):', err);
          this.loadingVehicles = false; // Ensure loading is off
       },
       complete: () => {
          console.log('VehicleBrowserComponent: fetchVehicles subscribe complete callback reached.');
          this.loadingVehicles = false;
          console.log('VehicleBrowserComponent: loadingVehicles set to false.');
       }
    });

    console.log('VehicleBrowserComponent: fetchVehicles method finished (HTTP request sent).');
  }

  // --- SEARCH/FILTER ---
  performSearch(event?: Event): void {
    event?.preventDefault();
     console.log('VehicleBrowserComponent: performSearch called with term:', this.searchVehicleName);

    const searchTerm = this.searchVehicleName.trim().toLowerCase();

    if (!searchTerm) {
      console.log('VehicleBrowserComponent: Search term is empty, showing all vehicles.');
      this.filteredVehicles = [...this.vehicles];
    } else {
      console.log('VehicleBrowserComponent: Filtering vehicles by term:', searchTerm);
      this.filteredVehicles = this.vehicles.filter(vehicle =>
        vehicle.vname?.toLowerCase().includes(searchTerm) ||
        vehicle.modele?.toLowerCase().includes(searchTerm) ||
        vehicle.marque?.toLowerCase().includes(searchTerm)
        // Add other relevant fields
      );
       console.log('VehicleBrowserComponent: Filtered vehicles:', this.filteredVehicles);
    }
  }

  // --- DATE INITIALIZATION ---
  initRentalDates(): void {
     console.log('VehicleBrowserComponent: initRentalDates called.');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const pad = (num: number) => num.toString().padStart(2, '0');
    const formatDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

    this.rentalData.pickupDate = formatDate(today);
    this.rentalData.returnDate = formatDate(tomorrow);
     console.log('VehicleBrowserComponent: Initial rental dates set:', this.rentalData.pickupDate, this.rentalData.returnDate);
  }

  // --- RENTAL MODAL HANDLING ---
  openRentalModal(vehicle: Voiture): void {
     console.log('VehicleBrowserComponent: openRentalModal called for vehicle:', vehicle);
    // 1. Check Authentication (Should already be logged in to reach this component via AuthGuard)
    if (this.authService.isLoggedIn()) { // Double check for safety
      console.log('VehicleBrowserComponent: User is logged in, opening rental modal.');
      this.selectedVehicle = vehicle;
      this.initRentalDates(); // Reset dates to default
      this.showRentalModal = true;
      this.rentalSubmissionError = null; // Clear previous errors
      if (isPlatformBrowser(this.platformId)) {
        document.body.style.overflow = 'hidden';
         console.log('VehicleBrowserComponent: Body overflow set to hidden.');
      }
    } else {
       console.warn('VehicleBrowserComponent: openRentalModal called but user is NOT logged in. Showing auth modal.');
      // This case should ideally not be reachable if component is protected by AuthGuard
      this.pendingRentalVehicle = vehicle; // Store the vehicle
      this.openAuthModal();
    }
  }

  closeRentalModal(): void {
     console.log('VehicleBrowserComponent: closeRentalModal called.');
    this.showRentalModal = false;
    this.selectedVehicle = null;
    this.rentalData = { pickupDate: '', returnDate: '', insurance: 'basic' }; // Reset form data
    this.isSubmittingRental = false;
    this.rentalSubmissionError = null;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
       console.log('VehicleBrowserComponent: Body overflow restored.');
    }
  }

  submitRentalRequest(): void {
     console.log('VehicleBrowserComponent: submitRentalRequest called.');
     if (!this.selectedVehicle) {
        console.error("VehicleBrowserComponent: Attempted to submit rental without a selected vehicle.");
        this.rentalSubmissionError = this.translate.instant('modal.error_general'); // Add error translation key
        return;
     }
      console.log('VehicleBrowserComponent: Selected vehicle for rental:', this.selectedVehicle);

     // Basic Date Validation
     if (!this.rentalData.pickupDate || !this.rentalData.returnDate) {
       console.warn('VehicleBrowserComponent: Date validation failed: Dates required.');
       this.rentalSubmissionError = this.translate.instant('modal.validation.date_required');
       return;
     }
     const pickupDate = new Date(this.rentalData.pickupDate);
     const returnDate = new Date(this.rentalData.returnDate);

     if (returnDate <= pickupDate) {
       console.warn('VehicleBrowserComponent: Date validation failed: Return date not after pickup date.');
       this.rentalSubmissionError = this.translate.instant('modal.validation.return_date_after');
       return;
     }
      if (pickupDate < new Date(new Date().setHours(0,0,0,0))) { // Check if pickup is in the past
         console.warn('VehicleBrowserComponent: Date validation failed: Pickup date in the past.');
         this.rentalSubmissionError = this.translate.instant('modal.validation.pickup_date_future'); // Add translation key
         return;
     }
     console.log('VehicleBrowserComponent: Date validation passed.');


     const userId = this.authService.getCurrentUserId(); // Get user ID from Auth Service
      if (userId === null || userId === undefined) {
         console.error("VehicleBrowserComponent: User ID not available for rental submission, but user IS logged in?");
         this.rentalSubmissionError = this.translate.instant('modal.error_auth_needed'); // Add translation key
         // Decide how to handle this state - maybe navigate to login again?
         // this.closeRentalModal();
         // this.openAuthModal();
         return;
      }
      console.log('VehicleBrowserComponent: User ID obtained:', userId);


     this.isSubmittingRental = true;
     this.rentalSubmissionError = null;

     const payload: CreateReservationPayload = {
         voitureId: this.selectedVehicle.id,
         userId: userId,
         dateDebut: this.rentalData.pickupDate, // Send as YYYY-MM-DD or convert to ISO if backend needs it
         dateFin: this.rentalData.returnDate,     // Send as YYYY-MM-DD or convert to ISO if backend needs it
         insuranceOption: this.rentalData.insurance,
     };

     console.log('VehicleBrowserComponent: Submitting Rental Request with payload:', payload);

     this.reservationService.createReservation(payload).pipe(
       catchError(error => {
         console.error('VehicleBrowserComponent: Rental submission failed in catchError:', error);
          // Check for specific error messages from backend if available in error.error
          const backendErrorMessage = (error.error && typeof error.error === 'object') ?
                                      (error.error.message || JSON.stringify(error.error)) :
                                      (typeof error.error === 'string' ? error.error : null);

         this.rentalSubmissionError = this.translate.instant('modal.error_submission') +
                                     (backendErrorMessage ? `: ${backendErrorMessage}` : '');
         this.isSubmittingRental = false;
         console.log('VehicleBrowserComponent: Rental submission error displayed.');
         return throwError(() => new Error('Rental submission failed')); // Rethrow or return empty observable
       })
     ).subscribe({
       next: (reservation) => {
         console.log('VehicleBrowserComponent: Rental submission subscribe next callback reached.');
         console.log('VehicleBrowserComponent: Rental successful:', reservation);
         alert(this.translate.instant('modal.rental_success', { reservationId: reservation.id })); // Add success translation
         this.closeRentalModal();
         console.log('VehicleBrowserComponent: Rental modal closed.');
         // Optional: Redirect user to their reservations page
         console.log('VehicleBrowserComponent: Navigating to /my-reservations');
         this.router.navigate(['/my-reservations']); // Adjust route as needed
       },
       error: (err) => {
           // This error callback is typically not hit if catchError is used correctly
           console.error('VehicleBrowserComponent: Rental submission subscribe error callback reached (should be handled by catchError):', err);
            this.isSubmittingRental = false;
       },
        complete: () => {
           console.log('VehicleBrowserComponent: Rental submission subscribe complete callback reached.');
           this.isSubmittingRental = false;
           console.log('VehicleBrowserComponent: isSubmittingRental set to false.');
        }
     });
     console.log('VehicleBrowserComponent: submitRentalRequest method finished (Rental API request sent).');
  }

  // --- AUTH MODAL HANDLING ---
  openAuthModal(): void {
     console.log('VehicleBrowserComponent: openAuthModal called.');
     this.showAuthModal = true;
     if (isPlatformBrowser(this.platformId)) {
       document.body.style.overflow = 'hidden';
       console.log('VehicleBrowserComponent: Body overflow set to hidden for auth modal.');
     }
  }

  closeAuthModal(): void {
     console.log('VehicleBrowserComponent: closeAuthModal called.');
     this.showAuthModal = false;
     this.pendingRentalVehicle = null; // Clear pending vehicle if modal is closed without action
     if (isPlatformBrowser(this.platformId)) {
       document.body.style.overflow = '';
       console.log('VehicleBrowserComponent: Body overflow restored after auth modal.');
     }
  }

  navigateToLogin(): void {
     console.log('VehicleBrowserComponent: Navigating to login.');
     this.closeAuthModal();
     this.router.navigate(['/login']); // Adjust your login route
     // Potentially pass pending rental info as state or query params (more advanced)
  }

  navigateToSignup(): void {
     console.log('VehicleBrowserComponent: Navigating to signup.');
     this.closeAuthModal();
     this.router.navigate(['/signup']); // Adjust your signup route
     // Potentially pass pending rental info as state or query params (more advanced)
  }

  // --- HELPER METHODS ---
  getTransmissionText(isAutomate: boolean | undefined): string {
     // console.log('VehicleBrowserComponent: getTransmissionText called with:', isAutomate);
    if (isAutomate === true) {
      return this.translate.instant('modal.transmission_auto'); // Add this key
    } else if (isAutomate === false) {
      return this.translate.instant('modal.transmission_manual'); // Add this key
    }
    return this.translate.instant('modal.transmission_unknown'); // Add this key
  }
    // Helper to format currency (re-using from dashboard if available or create here)
    formatCurrency(value: number | null): string {
        // console.log('VehicleBrowserComponent: formatCurrency called with:', value);
        if (value === null || value === undefined) {
            return 'N/A';
        }
        return value.toFixed(2) + ' €'; // Or your preferred currency symbol
    }
}
