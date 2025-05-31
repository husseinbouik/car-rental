import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service'; // Adjust path
import { ReservationService, Reservation } from '../services/reservation.service'; // Adjust path
import { catchError, of, EMPTY } from 'rxjs'; // Import EMPTY

@Component({
  selector: 'app-my-reservations',
  standalone: true, // Or false if part of a module
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
      this.fetchUserReservations();
    }
  }

  fetchUserReservations(): void {
    this.loadingReservations = true;
    this.reservationError = null;

    const userId = this.authService.getCurrentUserId(); // Get user ID

    if (userId === null || userId === undefined) {
       console.error("User ID not available to fetch reservations.");
       this.reservationError = this.translate.instant('reservations.error_auth'); // Add translation key
       this.loadingReservations = false;
       // Consider redirecting or prompting login again
       return;
    }

    this.reservationService.getUserReservations(userId).pipe(
      catchError(error => {
        console.error('Error fetching reservations:', error);
        this.reservationError = this.translate.instant('reservations.error_fetching'); // Add translation key
        this.loadingReservations = false;
        return of([]); // Return empty array on error to allow template to render
      })
    ).subscribe((data: Reservation[]) => {
      this.reservations = data;
      console.log('Reservations fetched:', this.reservations);
      this.loadingReservations = false;
    });
  }

  // --- CANCEL MODAL HANDLING ---
  openCancelConfirmModal(reservation: Reservation): void {
     // Optional: Check if cancellation is allowed based on reservation status or dates
     // if (reservation.status !== 'Pending' || new Date(reservation.dateDebut) < new Date()) {
     //    alert(this.translate.instant('reservations.cancel_not_allowed')); // Add translation key
     //    return;
     // }
    this.reservationToCancel = reservation;
    this.showCancelConfirmModal = true;
    this.cancelError = null; // Clear previous errors
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

    this.reservationService.cancelReservation(this.reservationToCancel.id).pipe(
      catchError(error => {
         console.error('Cancellation failed:', error);
         const backendErrorMessage = (error.error && typeof error.error === 'object') ?
                                      (error.error.message || JSON.stringify(error.error)) :
                                      (typeof error.error === 'string' ? error.error : null);
         this.cancelError = this.translate.instant('reservations.error_cancel') +
                           (backendErrorMessage ? `: ${backendErrorMessage}` : '');
         this.isCancelling = false;
         return EMPTY; // Stop the observable chain on error
      })
    ).subscribe(
      (updatedReservation) => {
        console.log('Cancellation successful:', updatedReservation);
        alert(this.translate.instant('reservations.cancel_success', { reservationId: updatedReservation.id })); // Add success translation
        this.closeCancelConfirmModal();
        this.fetchUserReservations(); // Refresh the list
      },
       // No error callback needed here due to catchError + EMPTY
       () => {
         // Complete callback (runs after success)
         this.isCancelling = false;
       }
    );
  }

  // --- HELPER METHODS ---
  formatCurrency(value: number | null): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    return value.toFixed(2) + ' €'; // Or your preferred currency symbol
  }

   formatDate(dateString: string): string {
       if (!dateString) return 'N/A';
       // You might want more sophisticated date formatting here
       // For simplicity, just returning the date string
       try {
           const date = new Date(dateString);
           return date.toLocaleDateString(this.translate.currentLang); // Format based on current language
       } catch (e) {
           return dateString; // Return original if parsing fails
       }
   }
}
