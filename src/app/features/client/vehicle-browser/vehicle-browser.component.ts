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

  // Static vehicle data
  private staticVehicles: Voiture[] = [
    {
      id: 1,
      vname: 'Mercedes C-Class',
      marque: 'Mercedes',
      modele: 'C-Class',
      type: 'Sedan',
      capacite: 5,
      carburant: 'Diesel',
      estAutomate: true,
      prixDeBase: 80,
      couleur: 'Black',
      photo: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop&crop=center'
    },
    {
      id: 2,
      vname: 'BMW X3',
      marque: 'BMW',
      modele: 'X3',
      type: 'SUV',
      capacite: 5,
      carburant: 'Gasoline',
      estAutomate: true,
      prixDeBase: 95,
      couleur: 'White',
      photo: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&crop=center'
    },
    {
      id: 3,
      vname: 'Audi A4',
      marque: 'Audi',
      modele: 'A4',
      type: 'Sedan',
      capacite: 5,
      carburant: 'Gasoline',
      estAutomate: true,
      prixDeBase: 85,
      couleur: 'Silver',
      photo: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&crop=center'
    },
    {
      id: 4,
      vname: 'Volkswagen Golf',
      marque: 'Volkswagen',
      modele: 'Golf',
      type: 'Hatchback',
      capacite: 5,
      carburant: 'Diesel',
      estAutomate: false,
      prixDeBase: 45,
      couleur: 'Blue',
      photo: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop&crop=center'
    },
    {
      id: 5,
      vname: 'Toyota Camry',
      marque: 'Toyota',
      modele: 'Camry',
      type: 'Sedan',
      capacite: 5,
      carburant: 'Hybrid',
      estAutomate: true,
      prixDeBase: 65,
      couleur: 'Gray',
      photo: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop&crop=center'
    },
    {
      id: 6,
      vname: 'Honda CR-V',
      marque: 'Honda',
      modele: 'CR-V',
      type: 'SUV',
      capacite: 5,
      carburant: 'Gasoline',
      estAutomate: true,
      prixDeBase: 75,
      couleur: 'Red',
      photo: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&crop=center'
    },
    {
      id: 7,
      vname: 'Tesla Model 3',
      marque: 'Tesla',
      modele: 'Model 3',
      type: 'Electric',
      capacite: 5,
      carburant: 'Electric',
      estAutomate: true,
      prixDeBase: 120,
      couleur: 'White',
      photo: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800&h=600&fit=crop&crop=center'
    },
    {
      id: 8,
      vname: 'Porsche 911',
      marque: 'Porsche',
      modele: '911',
      type: 'Sports',
      capacite: 2,
      carburant: 'Gasoline',
      estAutomate: true,
      prixDeBase: 250,
      couleur: 'Red',
      photo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop&crop=center'
    },
    {
      id: 9,
      vname: 'Range Rover Sport',
      marque: 'Land Rover',
      modele: 'Range Rover Sport',
      type: 'SUV',
      capacite: 5,
      carburant: 'Diesel',
      estAutomate: true,
      prixDeBase: 180,
      couleur: 'Black',
      photo: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop&crop=center'
    },
    {
      id: 10,
      vname: 'Lexus RX',
      marque: 'Lexus',
      modele: 'RX',
      type: 'SUV',
      capacite: 5,
      carburant: 'Hybrid',
      estAutomate: true,
      prixDeBase: 110,
      couleur: 'Silver',
      photo: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&crop=center'
    }
  ];

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

    // Handle different photo formats
    if (vehicle.photo) {
      if (typeof vehicle.photo === 'string') {
        if (vehicle.photo.startsWith('data:image')) {
          vehicle.photoDisplayUrl = vehicle.photo;
          return;
        } else if (vehicle.photo.startsWith('http')) {
          // Direct URL - use it as is
          vehicle.photoDisplayUrl = vehicle.photo;
          return;
        } else {
          // Base64 encoded image
          vehicle.photoDisplayUrl = 'data:image/jpeg;base64,' + vehicle.photo;
          return;
        }
      }
    }

    // If no photo URL is available, set error state
    vehicle.photoError = true;
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

    // Simulate API delay
    setTimeout(() => {
      this.allVehicles = this.processVehiclesForDisplay(this.staticVehicles);
      this.filteredVehicles = [...this.allVehicles];
      this.loadingInitialVehicles = false;
    }, 500);
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

      // Simulate availability check
      setTimeout(() => {
        // For static demo, all vehicles are available
        this.availableVehicles = this.processVehiclesForDisplay(this.staticVehicles);
        this.filteredVehicles = nameTerm
          ? this.availableVehicles.filter(v => this.vehicleMatchesName(v, nameTerm))
          : [...this.availableVehicles];
        this.isMainSearchLoading = false;
        this.updateListDisplayMessage();
      }, 800);
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

    // Simulate availability check
    setTimeout(() => {
      // For static demo, vehicle is always available
      if (this.selectedVehicle) {
        this.rentalData.pickupDate = this.dateSelectionForModal.pickupDate;
        this.rentalData.returnDate = this.dateSelectionForModal.returnDate;
        this.closeDateModal();
        this.showRentalModal = true;
        if (isPlatformBrowser(this.platformId)) document.body.style.overflow = 'hidden';
      }
      this.checkingAvailabilityModal = false;
    }, 800);
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
    this.rentalSubmissionError = this.translate.instant('modal.error_general');
    return;
  }

  try {
    const clientId = this.authService.getCurrentUserId();
    if (!clientId) {
      throw new Error('User not authenticated');
    }

    // Store reservation data in sessionStorage for payment component
    const reservationData = {
      voitureId: this.selectedVehicle.id,
      clientId: clientId,
      dateDebut: this.rentalData.pickupDate,
      dateFin: this.rentalData.returnDate,
      insuranceOption: this.rentalData.insurance,
      vehicle: this.selectedVehicle
    };

    sessionStorage.setItem('pendingReservation', JSON.stringify(reservationData));

    // Close modal and redirect to payment
    this.closeRentalModal();
    this.router.navigate(['/payment']);

  } catch (error) {
    this.isSubmittingRental = false;
    this.rentalSubmissionError = error instanceof Error ? error.message : 'Unknown error';
  }
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
