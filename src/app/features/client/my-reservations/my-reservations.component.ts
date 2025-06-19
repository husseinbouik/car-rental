import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { catchError, of, EMPTY } from 'rxjs';

interface StaticVehicle {
  id: number;
  vname: string;
  marque: string;
  modele: string;
  type: string;
  capacite: number;
  carburant: string;
  estAutomate: boolean;
  prixDeBase: number;
  couleur: string;
  photo?: string;
}

interface StaticReservation {
  id: number;
  voitureId: number;
  clientId: number;
  dateDebut: string;
  dateFin: string;
  status: string;
  prixTotal: number;
  voiture?: StaticVehicle;
}

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.css']
})
export class MyReservationsComponent implements OnInit {

  reservations: StaticReservation[] = [];
  loadingReservations = true;
  reservationError: string | null = null;

  // Static vehicle data
  private staticVehicles: StaticVehicle[] = [
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
      couleur: 'Black'
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
      couleur: 'White'
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
      couleur: 'Silver'
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
      couleur: 'Blue'
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
      couleur: 'Gray'
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
      couleur: 'Red'
    }
  ];

  // --- CANCEL MODAL PROPERTIES ---
  showCancelConfirmModal = false;
  reservationToCancel: StaticReservation | null = null;
  isCancelling = false;
  cancelError: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
     if (!this.authService.isLoggedIn()) {
        alert(this.translate.instant('reservations.auth_required'));
        this.router.navigate(['/login']);
        return;
     }

    if (isPlatformBrowser(this.platformId)) {
      this.fetchUserReservations();
    }
  }

  fetchUserReservations(): void {
    this.loadingReservations = true;
    this.reservationError = null;

    const userId = this.authService.getCurrentUserId();

    if (userId === null || userId === undefined) {
       console.error("User ID not available to fetch reservations.");
       this.reservationError = this.translate.instant('reservations.error_auth');
       this.loadingReservations = false;
       return;
    }

    // Simulate API delay
    setTimeout(() => {
      try {
        // Get reservations from localStorage
        const storedReservations = localStorage.getItem('userReservations');
        if (storedReservations) {
          const allReservations: StaticReservation[] = JSON.parse(storedReservations);
          // Filter reservations for current user and enrich with vehicle data
          this.reservations = allReservations
            .filter(reservation => reservation.clientId === userId)
            .map(reservation => ({
              ...reservation,
              voiture: this.getVehicleById(reservation.voitureId)
            }));
        } else {
          this.reservations = [];
        }

        this.loadingReservations = false;
      } catch (error) {
        console.error('Error fetching reservations:', error);
        this.reservationError = this.translate.instant('reservations.error_fetching');
        this.loadingReservations = false;
      }
    }, 500); // Simulate network delay
  }

  private getVehicleById(vehicleId: number): StaticVehicle | undefined {
    return this.staticVehicles.find(vehicle => vehicle.id === vehicleId);
  }

  // --- CANCEL MODAL HANDLING ---
  openCancelConfirmModal(reservation: StaticReservation): void {
    this.reservationToCancel = reservation;
    this.showCancelConfirmModal = true;
    this.cancelError = null;
     if (isPlatformBrowser(this.platformId)) {
       document.body.style.overflow = 'hidden';
     }
  }

  closeCancelConfirmModal(): void {
    this.showCancelConfirmModal = false;
    this.reservationToCancel = null;
    this.isCancelling = false;
    this.cancelError = null;
    if (isPlatformBrowser(this.platformId)) {
       document.body.style.overflow = '';
     }
  }

  confirmCancelReservation(): void {
    if (!this.reservationToCancel) {
      console.error("No reservation selected for cancellation.");
      this.cancelError = this.translate.instant('reservations.error_general');
      return;
    }

    this.isCancelling = true;
    this.cancelError = null;

    // Simulate API call delay
    setTimeout(() => {
      try {
        // Update reservation in localStorage
        const storedReservations = localStorage.getItem('userReservations');
        if (storedReservations) {
          const allReservations: StaticReservation[] = JSON.parse(storedReservations);
          const updatedReservations = allReservations.map(reservation =>
            reservation.id === this.reservationToCancel?.id
              ? { ...reservation, status: 'Cancelled' }
              : reservation
          );
          localStorage.setItem('userReservations', JSON.stringify(updatedReservations));
        }

        alert(this.translate.instant('reservations.cancel_success', { reservationId: this.reservationToCancel?.id }));
        this.closeCancelConfirmModal();
        this.fetchUserReservations(); // Refresh the list
      } catch (error) {
        console.error('Cancellation failed:', error);
        this.cancelError = this.translate.instant('reservations.error_cancel');
      } finally {
        this.isCancelling = false;
      }
    }, 1000); // Simulate network delay
  }

  // --- HELPER METHODS ---
  formatCurrency(value: number | null): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    return value.toFixed(2) + ' €';
  }

   formatDate(dateString: string): string {
       if (!dateString) return 'N/A';
       try {
           const date = new Date(dateString);
           return date.toLocaleDateString(this.translate.currentLang);
       } catch (e) {
           return dateString;
       }
   }

  getTransmissionText(isAutomate: boolean | undefined | null): string {
    if (isAutomate === true) return this.translate.instant('modal.transmission_auto');
    if (isAutomate === false) return this.translate.instant('modal.transmission_manual');
    return this.translate.instant('modal.transmission_unknown');
  }

  getVehicleDisplayName(vehicle?: StaticVehicle): string {
    if (!vehicle) return 'Unknown Vehicle';
    return vehicle.vname || `${vehicle.marque} ${vehicle.modele}`;
  }

  getRentalDuration(dateDebut: string, dateFin: string): string {
    try {
      const startDate = new Date(dateDebut);
      const endDate = new Date(dateFin);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      return `${daysDiff} ${daysDiff === 1 ? 'day' : 'days'}`;
    } catch (e) {
      return 'N/A';
    }
  }
}
