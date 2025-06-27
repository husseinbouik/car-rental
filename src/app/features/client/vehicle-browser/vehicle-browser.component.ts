import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Voiture } from '../../admin/vehicles/vehicle.model';
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

  // Rental modal
  showRentalModal = false;
  selectedVehicle: DisplayVoiture | null = null;
  rentalData: RentalData = { pickupDate: '', returnDate: '', insurance: 'basic' };
  isEditingDates = false;
  isVehicleAvailableForDates = true;
  availabilityMessage = '';

  // Success modal
  showSuccessModal = false;
  createdReservation: any = null;

  // Error states
  listDisplayError: string | null = null;
  rentalSubmissionError: string | null = null;

  isSubmittingRental = false;

  // View and sorting
  viewMode: 'grid' | 'list' = 'grid';
  sortBy: string = 'name';

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

    vehicle.isLoadingPhoto = true;
    vehicle.photoError = false;

    // First check if we have base64 data (fallback)
    if (vehicle.photo) {
      if (typeof vehicle.photo === 'string') {
        if (vehicle.photo.startsWith('data:image')) {
          vehicle.photoDisplayUrl = vehicle.photo;
          vehicle.isLoadingPhoto = false;
          return;
        } else if (vehicle.photo.startsWith('http')) {
          vehicle.photoDisplayUrl = vehicle.photo;
          vehicle.isLoadingPhoto = false;
          return;
        } else {
          // If it's base64 data, use it as fallback
          vehicle.photoDisplayUrl = 'data:image/jpeg;base64,' + vehicle.photo;
          vehicle.isLoadingPhoto = false;
          return;
        }
      }
    }

    // Use the API to fetch the photo
    const subscription = this.vehicleService.getVehiclePhoto(vehicle.id!)
      .pipe(
        catchError(error => {
          console.error(`Error loading photo for vehicle ${vehicle.id}:`, error);
          vehicle.photoError = true;
          vehicle.isLoadingPhoto = false;
          return of(null);
        })
      )
      .subscribe(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          vehicle.photoDisplayUrl = url;
          vehicle.photoError = false;
        } else {
          vehicle.photoError = true;
        }
        vehicle.isLoadingPhoto = false;
      });

    this.photoSubscriptions.push(subscription);
  }

  private processVehiclesForDisplay(vehicles: Voiture[]): DisplayVoiture[] {
    return vehicles.map(v => {
      const displayV: DisplayVoiture = { ...v, photoDisplayUrl: undefined, isLoadingPhoto: false, photoError: false };
      this.loadVehiclePhoto(displayV);
      return displayV;
    });
  }

  fetchAllVehicles(): void {
    this.loadingInitialVehicles = true;
    this.listDisplayError = null;

    this.vehicleService.getVehicles()
      .pipe(
        catchError(error => {
          console.error('Error fetching vehicles:', error);
          this.listDisplayError = error.message || this.translate.instant('vehicles.error_fetching');
          this.loadingInitialVehicles = false;
          return of([]);
        })
      )
      .subscribe((vehicles: Voiture[]) => {
        this.allVehicles = this.processVehiclesForDisplay(vehicles);
        this.filteredVehicles = [...this.allVehicles];
        this.loadingInitialVehicles = false;
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
      this.vehicleService.getAvailableVehicles(pickup, returnD)
        .pipe(
          catchError(error => {
            console.error('Error fetching available vehicles:', error);
            this.listDisplayError = error.message || this.translate.instant('vehicles.error_fetching');
            this.isMainSearchLoading = false;
            return of([]);
          })
        )
        .subscribe((vehicles: Voiture[]) => {
          this.availableVehicles = this.processVehiclesForDisplay(vehicles);
          this.filteredVehicles = nameTerm
            ? this.availableVehicles.filter(v => this.vehicleMatchesName(v, nameTerm))
            : [...this.availableVehicles];
          this.isMainSearchLoading = false;
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
    this.selectedVehicle = vehicle;
    this.showRentalModal = true;
    this.initDefaultModalDates();
    this.checkVehicleAvailability();
  }

  closeRentalModal(): void {
    this.showRentalModal = false;
    this.selectedVehicle = null;
    this.rentalSubmissionError = null;
    this.isEditingDates = false;
    this.isVehicleAvailableForDates = true;
    this.availabilityMessage = '';
  }

  initDefaultModalDates(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.rentalData.pickupDate = this.formatDate(today);
    this.rentalData.returnDate = this.formatDate(tomorrow);
  }

  checkVehicleAvailability(): void {
    if (!this.selectedVehicle || !this.rentalData.pickupDate || !this.rentalData.returnDate) {
      return;
    }

    this.vehicleService.getAvailableVehicles(this.rentalData.pickupDate, this.rentalData.returnDate)
      .pipe(
        catchError(error => {
          this.isVehicleAvailableForDates = false;
          this.availabilityMessage = error.message || this.translate.instant('vehicles.error_fetching');
          return of([]);
        })
      )
      .subscribe((vehicles: Voiture[]) => {
        const found = vehicles.some(v => v.id === this.selectedVehicle?.id);
        this.isVehicleAvailableForDates = found;
        this.availabilityMessage = found ? '' : this.translate.instant('modal.not_available_for_dates');
      });
  }

  toggleDateEditing(): void {
    this.isEditingDates = !this.isEditingDates;
    if (!this.isEditingDates) {
      // Reset to original dates when canceling edit
      this.initDefaultModalDates();
    }
  }

  updateDates(): void {
    if (!this.rentalData.pickupDate || !this.rentalData.returnDate) {
      this.rentalSubmissionError = 'Please select both pickup and return dates';
      return;
    }

    const pickupDate = new Date(this.rentalData.pickupDate);
    const returnDate = new Date(this.rentalData.returnDate);

    if (pickupDate >= returnDate) {
      this.rentalSubmissionError = 'Return date must be after pickup date';
      return;
    }

    // Clear any previous errors
    this.rentalSubmissionError = null;

    // Check availability for the new dates
    this.checkVehicleAvailability();

    // Exit edit mode
    this.isEditingDates = false;
  }

  submitRentalRequest(): void {
    console.log('=== SUBMIT RENTAL REQUEST DEBUG ===');
    console.log('Selected vehicle:', this.selectedVehicle);
    console.log('Rental data:', this.rentalData);

    if (!this.selectedVehicle) {
      console.error('No selected vehicle found');
      return;
    }

    this.isSubmittingRental = true;
    this.rentalSubmissionError = null;

    // Check availability before proceeding to payment
    const dateDebut = this.toIsoDateTime(this.rentalData.pickupDate);
    const dateFin = this.toIsoDateTime(this.rentalData.returnDate);

    console.log('Checking availability for dates:', { dateDebut, dateFin });

    this.vehicleService.getAvailableVehicles(this.rentalData.pickupDate, this.rentalData.returnDate)
      .pipe(
        catchError(error => {
          console.error('Error checking availability:', error);
          this.rentalSubmissionError = error.message || this.translate.instant('vehicles.error_checking_availability');
          this.isSubmittingRental = false;
          return of([]);
        })
      )
      .subscribe((availableVehicles: Voiture[]) => {
        console.log('Available vehicles received:', availableVehicles);
        console.log('Looking for vehicle ID:', this.selectedVehicle?.id);

        const isAvailable = availableVehicles.some(v => v.id === this.selectedVehicle?.id);
        console.log('Vehicle available:', isAvailable);

        if (!isAvailable) {
          console.log('Vehicle not available, showing error');
          this.rentalSubmissionError = this.translate.instant('modal.not_available_for_dates');
          this.isSubmittingRental = false;
          return;
        }

        // Vehicle is available, proceed to payment
        console.log('Vehicle is available, proceeding to payment');
        this.proceedToPayment();
      });
  }

  private proceedToPayment(): void {
    console.log('=== PROCEED TO PAYMENT DEBUG ===');
    console.log('Selected vehicle:', this.selectedVehicle);
    console.log('Current URL:', window.location.href);
    console.log('Router URL:', this.router.url);

    if (!this.selectedVehicle) {
      console.error('No selected vehicle found');
      return;
    }

    // Prepare reservation data for payment
    const clientId = this.authService.getCurrentClientId();
    const reservationData = {
      voitureId: this.selectedVehicle.id,
      clientId: clientId || 1, // Use actual client ID or fallback to 1
      dateDebut: this.toIsoDateTime(this.rentalData.pickupDate),
      dateFin: this.toIsoDateTime(this.rentalData.returnDate),
      insuranceOption: this.rentalData.insurance,
      vehicle: this.selectedVehicle
    };

    console.log('Reservation data to store:', reservationData);

    // Store reservation data in sessionStorage for payment component
    sessionStorage.setItem('pendingReservation', JSON.stringify(reservationData));
    console.log('Reservation data stored in sessionStorage');

    // Close modal and navigate to payment
    this.closeRentalModal();
    console.log('Modal closed, navigating to payment...');

    // Try different navigation approaches
    try {
      // Try with absolute path first
      console.log('Trying absolute path navigation...');
      this.router.navigate(['/payment'], { replaceUrl: false }).then(() => {
        console.log('Navigation to /payment successful');
      }).catch(error => {
        console.error('Absolute path navigation failed:', error);

        // Try with relative path
        console.log('Trying relative path navigation...');
        this.router.navigate(['payment'], { replaceUrl: false }).then(() => {
          console.log('Navigation to payment (relative) successful');
        }).catch(error2 => {
          console.error('Relative navigation also failed:', error2);

          // Try window.location as fallback
          console.log('Trying window.location fallback...');
          window.location.href = window.location.origin + '/payment';
        });
      });
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation
      window.location.href = window.location.origin + '/payment';
    }

    console.log('=== END PROCEED TO PAYMENT DEBUG ===');
  }

  private toIsoDateTime(date: string | undefined | null): string {
    if (!date) return new Date().toISOString(); // fallback to now
    if (date.includes('T')) {
      // If it's already a valid ISO string, return as is
      return date;
    }
    // If date is yyyy-MM-dd, convert to yyyy-MM-ddT00:00:00
    // Validate format
    const dateParts = date.split('-');
    if (dateParts.length === 3) {
      return `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].padStart(2, '0')}T00:00:00`;
    }
    // Try to parse and convert
    try {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('.')[0]; // yyyy-MM-ddTHH:mm:ss
      }
    } catch (e) {}
    // Fallback: now
    return new Date().toISOString().split('.')[0];
  }

  getTransmissionText(isAutomate: boolean | undefined | null): string {
    if (isAutomate === true) return this.translate.instant('modal.transmission_auto');
    if (isAutomate === false) return this.translate.instant('modal.transmission_manual');
    return this.translate.instant('modal.transmission_unknown');
  }

  formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    return value.toFixed(2) + ' MAD';
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortBy = target.value;
    this.sortVehicles();
  }

  private sortVehicles(): void {
    this.filteredVehicles.sort((a, b) => {
      switch (this.sortBy) {
        case 'price-low':
          return (a.prixDeBase || 0) - (b.prixDeBase || 0);
        case 'price-high':
          return (b.prixDeBase || 0) - (a.prixDeBase || 0);
        case 'seats':
          return (a.capacite || 0) - (b.capacite || 0);
        case 'name':
        default:
          const nameA = (a.vname || a.marque || '').toLowerCase();
          const nameB = (b.vname || b.marque || '').toLowerCase();
          return nameA.localeCompare(nameB);
      }
    });
  }

  retryLoading(): void {
    this.fetchAllVehicles();
  }

  reserveVehicle(vehicle: DisplayVoiture): void {
    if (!this.isVehicleInAvailableList(vehicle)) {
      return;
    }
    this.selectedVehicle = vehicle;
    this.showRentalModal = true;
  }
}
