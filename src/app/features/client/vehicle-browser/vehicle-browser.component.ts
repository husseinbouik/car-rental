import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Voiture } from '../../admin/vehicles/vehicle.model'; // Ensure this model is updated
import { VehicleService } from '../../admin/vehicles/vehicle.service';
import { AuthService } from '../auth.service';
import { ReservationService, CreateReservationPayload } from '../services/reservation.service';
import { catchError, of, throwError, finalize, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

interface RentalData {
  pickupDate: string;
  returnDate: string;
  insurance: string;
}

// Extended Voiture interface for display purposes within this component
interface DisplayVoiture extends Voiture {
  photoDisplayUrl?: string | null;
  isLoadingPhoto?: boolean;
  photoError?: boolean;
}

@Component({
  selector: 'app-vehicle-browser',
  standalone: false,
  templateUrl: './vehicle-browser.component.html',
  styleUrls: ['./vehicle-browser.component.css']
})
export class VehicleBrowserComponent implements OnInit, OnDestroy {
  // Vehicle lists
  allVehicles: DisplayVoiture[] = [];
  availableVehicles: DisplayVoiture[] = [];
  filteredVehicles: DisplayVoiture[] = [];

  // Main Search Criteria & State
  searchCriteria = {
    name: '',
    pickupDate: '',
    returnDate: ''
  };
  minDateForSearch: string;
  isMainSearchLoading = false;
  mainSearchError: string | null = null;

  // Loading states
  loadingInitialVehicles = true;
  checkingAvailabilityModal = false;

  // Date selection for Rental Modal
  showDateModal = false;
  dateSelectionForModal = {
    pickupDate: '',
    returnDate: ''
  };

  // Rental modal
  showRentalModal = false;
  selectedVehicle: DisplayVoiture | null = null; // Use DisplayVoiture
  rentalData: RentalData = { pickupDate: '', returnDate: '', insurance: 'basic' };

  // Error states
  listDisplayError: string | null = null;
  dateModalError: string | null = null;
  rentalSubmissionError: string | null = null;

  isSubmittingRental = false;
  showAuthModal = false;
  pendingRentalVehicle: DisplayVoiture | null = null; // Use DisplayVoiture

  private photoSubscriptions: Subscription[] = [];

  constructor(
    private vehicleService: VehicleService,
    private authService: AuthService,
    private reservationService: ReservationService,
    private router: Router,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.minDateForSearch = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.fetchAllVehicles();
      this.initDefaultSearchDates();
      this.initDefaultModalDates();
    } else {
      this.loadingInitialVehicles = false;
    }
  }

  ngOnDestroy(): void {
    this.photoSubscriptions.forEach(sub => sub.unsubscribe());
    if (isPlatformBrowser(this.platformId)) {
      const allDisplayVehicles = [...this.allVehicles, ...this.availableVehicles];
      const uniqueVehicles = Array.from(new Set(allDisplayVehicles.map(v => v.id)))
                                   .map(id => allDisplayVehicles.find(v => v.id === id));

      uniqueVehicles.forEach(vehicle => {
        if (vehicle && vehicle.photoDisplayUrl && vehicle.photoDisplayUrl.startsWith('blob:')) {
          URL.revokeObjectURL(vehicle.photoDisplayUrl);
        }
      });
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  initDefaultSearchDates(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.searchCriteria.pickupDate = this.formatDate(today);
    this.searchCriteria.returnDate = this.formatDate(tomorrow);
  }

  initDefaultModalDates(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.dateSelectionForModal.pickupDate = this.formatDate(today);
    this.dateSelectionForModal.returnDate = this.formatDate(tomorrow);
    this.rentalData.pickupDate = this.dateSelectionForModal.pickupDate;
    this.rentalData.returnDate = this.dateSelectionForModal.returnDate;
  }

  isVehicleInAvailableList(vehicle: DisplayVoiture): boolean {
    if (!vehicle || vehicle.id === undefined || vehicle.id === null || this.availableVehicles.length === 0) {
      return false;
    }
    return this.availableVehicles.some(av => av.id === vehicle.id);
  }

  loadVehiclePhoto(vehicle: DisplayVoiture): void {
    if (!isPlatformBrowser(this.platformId) || !vehicle.id || vehicle.photoDisplayUrl || vehicle.isLoadingPhoto) {
      return;
    }
    if (vehicle.photo && typeof vehicle.photo === 'string') {
      if (vehicle.photo.startsWith('data:image')) {
          vehicle.photoDisplayUrl = vehicle.photo;
          return;
      } else if (!vehicle.photo.startsWith('http')) {
          vehicle.photoDisplayUrl = 'data:image/jpeg;base64,' + vehicle.photo; // Assuming JPEG
          return;
      }
    }

    vehicle.isLoadingPhoto = true;
    vehicle.photoError = false;
    const sub = this.vehicleService.getVehiclePhoto(vehicle.id).pipe(
      finalize(() => vehicle.isLoadingPhoto = false)
    ).subscribe({
      next: (imageBlob) => {
        if (imageBlob && imageBlob.size > 0) {
          vehicle.photoDisplayUrl = URL.createObjectURL(imageBlob);
        } else {
          vehicle.photoError = true;
        }
      },
      error: () => vehicle.photoError = true
    });
    this.photoSubscriptions.push(sub);
  }

  private processVehiclesForDisplay(vehicles: Voiture[]): DisplayVoiture[] {
    return vehicles.map(v => {
      const displayV: DisplayVoiture = { ...v, photoDisplayUrl: undefined, isLoadingPhoto: false, photoError: false };
      this.loadVehiclePhoto(displayV); // Will first check for existing base64, then fetch if needed
      return displayV;
    });
  }

  fetchAllVehicles(): void {
    this.loadingInitialVehicles = true;
    this.listDisplayError = null;
    this.vehicleService.getVehicles().pipe(
      catchError(error => {
        this.listDisplayError = this.translate.instant('vehicles.error_fetching');
        return of([]);
      }),
      finalize(() => this.loadingInitialVehicles = false)
    ).subscribe(vehicles => {
      this.allVehicles = this.processVehiclesForDisplay(vehicles);
      this.filteredVehicles = [...this.allVehicles];
    });
  }

  performMainSearch(event?: Event): void {
    if (event) event.preventDefault();
    this.listDisplayError = null;
    this.mainSearchError = null;
    this.isMainSearchLoading = true;
    this.availableVehicles = [];

    const nameTerm = this.searchCriteria.name.toLowerCase().trim();
    const pickup = this.searchCriteria.pickupDate;
    const returnD = this.searchCriteria.returnDate;

    if (pickup && returnD) {
      const pDate = new Date(pickup);
      const rDate = new Date(returnD);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (pDate < today) {
        this.mainSearchError = this.translate.instant('modal.validation.pickup_date_past');
        this.isMainSearchLoading = false; this.filteredVehicles = []; this.updateListDisplayMessage(); return;
      }
      if (rDate <= pDate) {
        this.mainSearchError = this.translate.instant('modal.validation.return_date_after');
        this.isMainSearchLoading = false; this.filteredVehicles = []; this.updateListDisplayMessage(); return;
      }
      this.vehicleService.getAvailableVehicles(pickup, returnD).pipe(
        catchError(error => {
          this.mainSearchError = this.translate.instant('vehicles.error_checking_availability');
          return of([]);
        }),
        finalize(() => this.isMainSearchLoading = false)
      ).subscribe(vehiclesFromApi => {
        this.availableVehicles = this.processVehiclesForDisplay(vehiclesFromApi);
        this.filteredVehicles = nameTerm
          ? this.availableVehicles.filter(v => this.vehicleMatchesName(v, nameTerm))
          : [...this.availableVehicles];
        this.updateListDisplayMessage();
      });
    } else if (nameTerm) {
      this.filteredVehicles = this.allVehicles.filter(v => this.vehicleMatchesName(v, nameTerm));
      this.isMainSearchLoading = false; this.updateListDisplayMessage();
    } else {
      this.filteredVehicles = [...this.allVehicles];
      this.isMainSearchLoading = false; this.updateListDisplayMessage();
    }
  }

  private vehicleMatchesName(vehicle: DisplayVoiture, term: string): boolean {
    return (typeof vehicle.vname === 'string' && vehicle.vname.toLowerCase().includes(term)) ||
           (typeof vehicle.marque === 'string' && vehicle.marque.toLowerCase().includes(term)) ||
           (typeof vehicle.modele === 'string' && vehicle.modele.toLowerCase().includes(term));
  }

  private updateListDisplayMessage(): void {
    if (this.filteredVehicles.length === 0 && !this.isMainSearchLoading && !this.loadingInitialVehicles) {
      if (this.searchCriteria.pickupDate && this.searchCriteria.returnDate) {
        this.listDisplayError = this.translate.instant('vehicles.no_vehicles_for_dates_criteria');
      } else if (this.searchCriteria.name) {
        this.listDisplayError = this.translate.instant('vehicles.no_matching_vehicles');
      } else if (this.allVehicles.length > 0) {
         this.listDisplayError = this.translate.instant('vehicles.no_vehicles_found');
      }
    } else {
      this.listDisplayError = null;
    }
  }

  resetMainSearchFilters(): void {
    this.searchCriteria.name = '';
    this.initDefaultSearchDates();
    this.mainSearchError = null;
    this.listDisplayError = null;
    this.availableVehicles = [];
    this.filteredVehicles = [...this.allVehicles];
    this.isMainSearchLoading = false;
    this.updateListDisplayMessage();
  }

  openRentalModal(vehicle: DisplayVoiture): void {
    if (!this.authService.isLoggedIn()) {
      this.pendingRentalVehicle = vehicle;
      this.openAuthModal();
      return;
    }
    this.selectedVehicle = vehicle;
    this.dateModalError = null;
    this.showDateModal = true;
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = 'hidden';
  }

  closeDateModal(): void {
    this.showDateModal = false;
    this.dateModalError = null;
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = '';
  }

  checkAvailabilityForModal(): void {
    this.dateModalError = null;
    if (!this.dateSelectionForModal.pickupDate || !this.dateSelectionForModal.returnDate) {
      this.dateModalError = this.translate.instant('modal.validation.date_required'); return;
    }
    const pickup = new Date(this.dateSelectionForModal.pickupDate);
    const returnD = new Date(this.dateSelectionForModal.returnDate);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (pickup < today) {
      this.dateModalError = this.translate.instant('modal.validation.pickup_date_past'); return;
    }
    if (returnD <= pickup) {
      this.dateModalError = this.translate.instant('modal.validation.return_date_after'); return;
    }
    this.checkingAvailabilityModal = true;
    this.vehicleService.getAvailableVehicles(
      this.dateSelectionForModal.pickupDate,
      this.dateSelectionForModal.returnDate
    ).pipe(
      catchError(error => {
        this.dateModalError = this.translate.instant('vehicles.error_checking_availability');
        return of([]);
      }),
      finalize(() => this.checkingAvailabilityModal = false)
    ).subscribe(availableVehiclesForModal => {
      if (this.selectedVehicle && availableVehiclesForModal.some(v => v.id === this.selectedVehicle?.id)) {
        this.rentalData.pickupDate = this.dateSelectionForModal.pickupDate;
        this.rentalData.returnDate = this.dateSelectionForModal.returnDate;
        this.closeDateModal();
        this.showRentalModal = true;
        if (isPlatformBrowser(this.platformId)) document.body.style.overflow = 'hidden';
      } else if (this.selectedVehicle) {
        this.dateModalError = this.translate.instant('vehicles.not_available_dates');
      } else {
        this.closeDateModal();
      }
    });
  }

  closeRentalModal(): void {
    this.showRentalModal = false;
    this.selectedVehicle = null;
    this.rentalData = { pickupDate: '', returnDate: '', insurance: 'basic' };
    this.isSubmittingRental = false;
    this.rentalSubmissionError = null;
    this.initDefaultModalDates();
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = '';
  }

  submitRentalRequest(): void {
    if (!this.selectedVehicle) {
      this.rentalSubmissionError = this.translate.instant('modal.error_general'); return;
    }
    if (!this.rentalData.pickupDate || !this.rentalData.returnDate) {
      this.rentalSubmissionError = this.translate.instant('modal.validation.date_required'); return;
    }
    const pickupDate = new Date(this.rentalData.pickupDate);
    const returnDate = new Date(this.rentalData.returnDate);
    const today = new Date(); today.setHours(0,0,0,0);
    if (pickupDate < today) {
      this.rentalSubmissionError = this.translate.instant('modal.validation.pickup_date_past'); return;
    }
    if (returnDate <= pickupDate) {
      this.rentalSubmissionError = this.translate.instant('modal.validation.return_date_after'); return;
    }
    const userId = this.authService.getCurrentUserId();
    if (userId === null || userId === undefined) {
      this.rentalSubmissionError = this.translate.instant('modal.error_auth_needed_refresh'); return;
    }
    this.isSubmittingRental = true;
    this.rentalSubmissionError = null;
    const payload: CreateReservationPayload = {
      voitureId: this.selectedVehicle.id, userId: userId,
      dateDebut: this.rentalData.pickupDate, dateFin: this.rentalData.returnDate,
      insuranceOption: this.rentalData.insurance,
    };
    this.reservationService.createReservation(payload).pipe(
      catchError((error: HttpErrorResponse | Error) => {
        let backendErrorMessage = 'An unknown error occurred.';
        if (error instanceof HttpErrorResponse) {
          backendErrorMessage = (error.error && typeof error.error === 'object') ?
                                  (error.error.message || JSON.stringify(error.error)) :
                                  (typeof error.error === 'string' ? error.error : error.message);
        } else if (error instanceof Error) {
          backendErrorMessage = error.message;
        }
        this.rentalSubmissionError = `${this.translate.instant('modal.error_submission')} ${backendErrorMessage}`;
        return throwError(() => error);
      }),
      finalize(() => this.isSubmittingRental = false)
    ).subscribe({
      next: (reservation) => {
        alert(this.translate.instant('modal.rental_success', { reservationId: reservation.id }));
        this.closeRentalModal();
        this.router.navigate(['/my-reservations']);
      },
      error: (err) => console.error('VehicleBrowserComponent: Rental submission final error:', err)
    });
  }

  openAuthModal(): void {
    this.showAuthModal = true;
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = 'hidden';
  }

  closeAuthModal(): void {
    this.showAuthModal = false; this.pendingRentalVehicle = null;
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = '';
  }

  navigateToLogin(): void { this.closeAuthModal(); this.router.navigate(['/login']); }
  navigateToSignup(): void { this.closeAuthModal(); this.router.navigate(['/signup']); }

  getTransmissionText(isAutomate: boolean | undefined | null): string {
    if (isAutomate === true) return this.translate.instant('modal.transmission_auto');
    if (isAutomate === false) return this.translate.instant('modal.transmission_manual');
    return this.translate.instant('modal.transmission_unknown');
  }

  formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(2) + ' €';
  }
}
