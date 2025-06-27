import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ReservationService, Reservation, CancellationPayload } from '../services/reservation.service';
import { ClientService } from '../../admin/clients/client.service';
import { VehicleService } from '../../admin/vehicles/vehicle.service';
import { catchError, of, EMPTY, Subscription } from 'rxjs';

// Extended Reservation interface for display purposes
interface DisplayReservation extends Reservation {
  photoDisplayUrl?: string | null;
  isLoadingPhoto?: boolean;
  photoError?: boolean;
}

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.css']
})
export class MyReservationsComponent implements OnInit, OnDestroy {

  reservations: DisplayReservation[] = [];
  loadingReservations = true;
  reservationError: string | null = null;

  private photoSubscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private reservationService: ReservationService,
    private clientService: ClientService,
    private vehicleService: VehicleService,
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

  ngOnDestroy(): void {
    this.photoSubscriptions.forEach(sub => sub.unsubscribe());
    if (isPlatformBrowser(this.platformId)) {
      this.reservations.forEach(reservation => {
        if (reservation.photoDisplayUrl && reservation.photoDisplayUrl.startsWith('blob:')) {
          URL.revokeObjectURL(reservation.photoDisplayUrl);
        }
      });
    }
  }

  fetchUserReservations(): void {
    this.loadingReservations = true;
    this.reservationError = null;

    // Use client_id instead of user_id
    const clientId = this.authService.getCurrentClientId();

    if (clientId === null || clientId === undefined) {
       console.error("Client ID not available to fetch reservations.");
       this.reservationError = this.translate.instant('reservations.error_auth');
       this.loadingReservations = false;
       return;
    }

    // Use the actual reservation service
    this.reservationService.getUserReservations(clientId)
      .pipe(
        catchError(error => {
          console.error('Error fetching reservations:', error);
          this.reservationError = this.translate.instant('reservations.error_fetching');
          this.loadingReservations = false;
          return of([]);
        })
      )
      .subscribe(reservations => {
        this.reservations = this.processReservationsForDisplay(reservations);
        this.loadingReservations = false;
      });
  }

  private processReservationsForDisplay(reservations: Reservation[]): DisplayReservation[] {
    return reservations.map(r => {
      const displayR: DisplayReservation = {
        ...r,
        photoDisplayUrl: undefined,
        isLoadingPhoto: false,
        photoError: false
      };
      this.loadVehiclePhoto(displayR);
      return displayR;
    });
  }

  loadVehiclePhoto(reservation: DisplayReservation): void {
    if (!isPlatformBrowser(this.platformId) || !reservation.voiture?.id || reservation.photoDisplayUrl || reservation.isLoadingPhoto) {
      return;
    }

    reservation.isLoadingPhoto = true;
    reservation.photoError = false;

    // First check if we have base64 data (fallback)
    if (reservation.voiture?.photo) {
      if (typeof reservation.voiture.photo === 'string') {
        if (reservation.voiture.photo.startsWith('data:image')) {
          reservation.photoDisplayUrl = reservation.voiture.photo;
          reservation.isLoadingPhoto = false;
          return;
        } else if (reservation.voiture.photo.startsWith('http')) {
          reservation.photoDisplayUrl = reservation.voiture.photo;
          reservation.isLoadingPhoto = false;
          return;
        } else {
          // If it's base64 data, use it as fallback
          reservation.photoDisplayUrl = 'data:image/jpeg;base64,' + reservation.voiture.photo;
          reservation.isLoadingPhoto = false;
          return;
        }
      }
    }

    // Use the API to fetch the photo
    const subscription = this.vehicleService.getVehiclePhoto(reservation.voiture!.id!)
      .pipe(
        catchError(error => {
          console.error(`Error loading photo for vehicle ${reservation.voiture!.id}:`, error);
          reservation.photoError = true;
          reservation.isLoadingPhoto = false;
          return of(null);
        })
      )
      .subscribe(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          reservation.photoDisplayUrl = url;
          reservation.photoError = false;
        } else {
          reservation.photoError = true;
        }
        reservation.isLoadingPhoto = false;
      });

    this.photoSubscriptions.push(subscription);
  }

  // --- HELPER METHODS ---
  formatCurrency(value: number | null): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    return value.toFixed(2) + ' MAD';
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

  getVehicleDisplayName(reservation: DisplayReservation): string {
    if (!reservation.voiture) return 'Unknown Vehicle';
    return reservation.voiture.vname || `${reservation.voiture.marque} ${reservation.voiture.modele}`;
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

  // Get status badge class
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'PaymentFailed':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }
}
