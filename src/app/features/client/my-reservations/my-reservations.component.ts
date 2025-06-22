import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ReservationService } from '../services/reservation.service';
import { ClientService } from '../../admin/clients/client.service';
import { catchError, of, EMPTY } from 'rxjs';
import { Reservation } from '../services/reservation.service';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.css']
})
export class MyReservationsComponent implements OnInit {

  reservations: Reservation[] = [];
  loadingReservations = true;
  reservationError: string | null = null;

  // --- CANCEL MODAL PROPERTIES ---
  showCancelConfirmModal = false;
  reservationToCancel: Reservation | null = null;
  isCancelling = false;
  cancelError: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private reservationService: ReservationService,
    private clientService: ClientService,
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
        this.reservations = reservations;
        this.loadingReservations = false;
      });
  }

  // --- CANCEL MODAL HANDLING ---
  openCancelConfirmModal(reservation: Reservation): void {
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

    // Use the actual reservation service to cancel
    this.reservationService.cancelReservation(this.reservationToCancel.id)
      .pipe(
        catchError(error => {
          console.error('Cancellation failed:', error);
          this.cancelError = this.translate.instant('reservations.error_cancel');
          this.isCancelling = false;
          return EMPTY;
        })
      )
      .subscribe(() => {
        alert(this.translate.instant('reservations.cancel_success', { reservationId: this.reservationToCancel?.id }));
        this.closeCancelConfirmModal();
        this.fetchUserReservations(); // Refresh the list
        this.isCancelling = false;
      });
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

  getVehicleDisplayName(reservation: Reservation): string {
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
}
