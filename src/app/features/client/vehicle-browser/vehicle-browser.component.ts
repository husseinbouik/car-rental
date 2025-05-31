import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Voiture } from '../../admin/vehicles/vehicle.model'; // Adjust path
import { VehicleService } from '../../admin/vehicles/vehicle.service'; // Adjust path
import { AuthService } from '../auth.service';
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
  standalone: true, // Or false if part of a module
  imports: [CommonModule, FormsModule, TranslateModule],
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

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
       // Redirect to login if not authenticated
       alert(this.translate.instant('reservations.auth_required')); // Add translation key
       this.router.navigate(['/login']); // Adjust login route
       return; // Stop execution
    }
    if (isPlatformBrowser(this.platformId)) {
      this.fetchVehicles();
      this.initRentalDates();
    }
  }

  fetchVehicles(): void {
    this.loadingVehicles = true;
    this.vehicleError = null;
     // Consider using getAvailableVehicles() if your backend provides it
    this.vehicleService.getVehicles().pipe(
      catchError(error => {
        console.error('Error fetching vehicles:', error);
        this.vehicleError = this.translate.instant('vehicles.error_fetching'); // Add this key to your translations
        this.loadingVehicles = false;
        return of([]);
      })
    ).subscribe((data: Voiture[]) => {
      this.vehicles = data;
      this.filteredVehicles = [...this.vehicles]; // Show all initially
      console.log('Vehicles fetched:', this.vehicles);
      this.loadingVehicles = false;
    });
  }

  // --- SEARCH/FILTER ---
  performSearch(event?: Event): void {
    event?.preventDefault();

    const searchTerm = this.searchVehicleName.trim().toLowerCase();

    if (!searchTerm) {
      this.filteredVehicles = [...this.vehicles];
    } else {
      this.filteredVehicles = this.vehicles.filter(vehicle =>
        vehicle.vname?.toLowerCase().includes(searchTerm) ||
        vehicle.modele?.toLowerCase().includes(searchTerm) ||
        vehicle.marque?.toLowerCase().includes(searchTerm)
        // Add other relevant fields
      );
    }
  }

  // --- DATE INITIALIZATION ---
  initRentalDates(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const pad = (num: number) => num.toString().padStart(2, '0');
    // Format dates as YYYY-MM-DD for input[type=date]
    const formatDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

    this.rentalData.pickupDate = formatDate(today);
    this.rentalData.returnDate = formatDate(tomorrow);
  }

  // --- RENTAL MODAL HANDLING ---
  openRentalModal(vehicle: Voiture): void {
    // 1. Check Authentication
    if (this.authService.isLoggedIn()) {
      // If logged in, proceed to the rental details modal
      this.selectedVehicle = vehicle;
      this.initRentalDates(); // Reset dates to default
      this.showRentalModal = true;
      this.rentalSubmissionError = null; // Clear previous errors
      if (isPlatformBrowser(this.platformId)) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      // If not logged in, show the auth required modal
      this.pendingRentalVehicle = vehicle; // Store the vehicle
      this.openAuthModal();
    }
  }

  closeRentalModal(): void {
    this.showRentalModal = false;
    this.selectedVehicle = null;
    this.rentalData = { pickupDate: '', returnDate: '', insurance: 'basic' }; // Reset form data
    this.isSubmittingRental = false;
    this.rentalSubmissionError = null;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  submitRentalRequest(): void {
     if (!this.selectedVehicle) {
        console.error("Attempted to submit rental without a selected vehicle.");
        this.rentalSubmissionError = this.translate.instant('modal.error_general'); // Add error translation key
        return;
     }

     // Basic Date Validation
     if (!this.rentalData.pickupDate || !this.rentalData.returnDate) {
       this.rentalSubmissionError = this.translate.instant('modal.validation.date_required');
       return;
     }
     const pickupDate = new Date(this.rentalData.pickupDate);
     const returnDate = new Date(this.rentalData.returnDate);

     if (returnDate <= pickupDate) {
       this.rentalSubmissionError = this.translate.instant('modal.validation.return_date_after');
       return;
     }
      if (pickupDate < new Date(new Date().setHours(0,0,0,0))) { // Check if pickup is in the past
         this.rentalSubmissionError = this.translate.instant('modal.validation.pickup_date_future'); // Add translation key
         return;
     }


     const userId = this.authService.getCurrentUserId(); // Get user ID from Auth Service
      if (userId === null || userId === undefined) {
         // This case should ideally not happen if isLoggedIn() was true,
         // but as a safeguard:
         console.error("User ID not available for rental submission.");
         this.rentalSubmissionError = this.translate.instant('modal.error_auth_needed'); // Add translation key
         this.closeRentalModal(); // Maybe close rental modal and show auth modal again? Depends on desired flow.
         this.openAuthModal();
         return;
      }


     this.isSubmittingRental = true;
     this.rentalSubmissionError = null;

     const payload: CreateReservationPayload = {
         voitureId: this.selectedVehicle.id,
         userId: userId,
         dateDebut: this.rentalData.pickupDate, // Send as YYYY-MM-DD or convert to ISO if backend needs it
         dateFin: this.rentalData.returnDate,     // Send as YYYY-MM-DD or convert to ISO if backend needs it
         insuranceOption: this.rentalData.insurance,
     };

     console.log('Submitting Rental Request:', payload);

     this.reservationService.createReservation(payload).pipe(
       catchError(error => {
         console.error('Rental submission failed:', error);
          // Check for specific error messages from backend if available in error.error
          const backendErrorMessage = (error.error && typeof error.error === 'object') ?
                                      (error.error.message || JSON.stringify(error.error)) :
                                      (typeof error.error === 'string' ? error.error : null);

         this.rentalSubmissionError = this.translate.instant('modal.error_submission') +
                                     (backendErrorMessage ? `: ${backendErrorMessage}` : '');
         this.isSubmittingRental = false;
         return throwError(() => new Error('Rental submission failed')); // Rethrow or return empty observable
       })
     ).subscribe(
       (reservation) => {
         console.log('Rental successful:', reservation);
         alert(this.translate.instant('modal.rental_success', { reservationId: reservation.id })); // Add success translation
         this.closeRentalModal();
         // Optional: Redirect user to their reservations page
         this.router.navigate(['/my-reservations']); // Adjust route as needed
       },
        // The error is already handled by catchError, the 'error' callback here is less common in modern Angular+RxJS
        // error => { ... handled by catchError ... }
        () => {
           // Complete callback - runs after success or error
           this.isSubmittingRental = false;
        }
     );
  }

  // --- AUTH MODAL HANDLING ---
  openAuthModal(): void {
     this.showAuthModal = true;
     // Optional: Store current URL or vehicle ID to redirect back after login
     // e.g., this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url, vehicleId: this.pendingRentalVehicle?.id } });
     if (isPlatformBrowser(this.platformId)) {
       document.body.style.overflow = 'hidden';
     }
  }

  closeAuthModal(): void {
     this.showAuthModal = false;
     this.pendingRentalVehicle = null; // Clear pending vehicle if modal is closed without action
     if (isPlatformBrowser(this.platformId)) {
       document.body.style.overflow = '';
     }
  }

  navigateToLogin(): void {
     this.closeAuthModal();
     this.router.navigate(['/login']); // Adjust your login route
     // Potentially pass pending rental info as state or query params
  }

  navigateToSignup(): void {
     this.closeAuthModal();
     this.router.navigate(['/signup']); // Adjust your signup route
     // Potentially pass pending rental info as state or query params
  }

  // --- HELPER METHODS ---
  getTransmissionText(isAutomate: boolean | undefined): string {
    // Use TranslateService here too for consistency
    if (isAutomate === true) {
      return this.translate.instant('modal.transmission_auto'); // Add this key
    } else if (isAutomate === false) {
      return this.translate.instant('modal.transmission_manual'); // Add this key
    }
    return this.translate.instant('modal.transmission_unknown'); // Add this key
  }
    // Helper to format currency (re-using from dashboard if available or create here)
    formatCurrency(value: number | null): string {
        if (value === null || value === undefined) {
            return 'N/A';
        }
        return value.toFixed(2) + ' €'; // Or your preferred currency symbol
    }
}
