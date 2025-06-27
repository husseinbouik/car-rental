import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ReservationService, CreateReservationPayload, PaymentPayload } from '../services/reservation.service';
import { catchError, of, switchMap } from 'rxjs';

interface ReservationData {
  voitureId: number;
  clientId: number;
  dateDebut: string;
  dateFin: string;
  insuranceOption: string;
  vehicle: any;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  // Payment data
  selectedPaymentMethod: 'card' | 'paypal' | 'cash' = 'card';
  cardNumber: string = '';
  cardName: string = '';
  expiryDate: string = '';
  cvv: string = '';
  isProcessing: boolean = false;
  paymentError: string | null = null;

  // Reservation data
  reservationData: ReservationData | null = null;
  reservationDetails = {
    vehicleName: '',
    duration: '',
    basePrice: 0,
    insurancePrice: 0,
    taxes: 0,
    total: 0
  };

  // Payment validation
  isFormValid = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    // Validate authentication first
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Get reservation data from sessionStorage
    const storedData = sessionStorage.getItem('pendingReservation');
    if (!storedData) {
      this.router.navigate(['/vehicle-browser']);
      return;
    }

    try {
      this.reservationData = JSON.parse(storedData);
      this.calculateReservationDetails();
    } catch (error) {
      console.error('Error parsing reservation data:', error);
      this.router.navigate(['/vehicle-browser']);
    }
  }

  private calculateReservationDetails(): void {
    if (!this.reservationData || !this.reservationData.vehicle) {
      return;
    }

    const vehicle = this.reservationData.vehicle;
    const startDate = new Date(this.reservationData.dateDebut);
    const endDate = new Date(this.reservationData.dateFin);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

    // Enhanced pricing calculation with insurance options
    const basePrice = (vehicle.prixDeBase || 60) * daysDiff;
    let insurancePrice = 0;

    switch (this.reservationData.insuranceOption) {
      case 'basic':
        insurancePrice = 15 * daysDiff;
        break;
      case 'premium':
        insurancePrice = 25 * daysDiff;
        break;
      case 'full':
        insurancePrice = 35 * daysDiff;
        break;
      default:
        insurancePrice = 15 * daysDiff;
    }

    const taxes = basePrice * 0.125; // 12.5% tax

    this.reservationDetails = {
      vehicleName: vehicle.vname || `${vehicle.marque} ${vehicle.modele}`,
      duration: `${daysDiff} days`,
      basePrice: basePrice,
      insurancePrice: insurancePrice,
      taxes: taxes,
      total: basePrice + insurancePrice + taxes
    };
  }

  onPaymentMethodChange(method: 'card' | 'paypal' | 'cash'): void {
    this.selectedPaymentMethod = method;
    this.validateForm();
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim();
    this.cardNumber = formattedValue;
    this.validateForm();
  }

  onCardNameChange(event: any): void {
    this.cardName = event.target.value;
    this.validateForm();
  }

  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.expiryDate = value;
    this.validateForm();
  }

  onCvvChange(event: any): void {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    this.cvv = value;
    this.validateForm();
  }

  private validateForm(): void {
    // Simplified validation - just check if payment method is selected
    this.isFormValid = true;
  }

  onSubmit(): void {
    if (this.isProcessing) return;

    // Validate authentication before proceeding
    if (!this.validateAuthentication()) {
      return;
    }

    this.isProcessing = true;
    this.paymentError = null;
    console.log('Processing payment...');

    // First create the reservation
    this.createReservationFirst();
  }

  private createReservationFirst(): void {
    if (!this.reservationData) {
      this.isProcessing = false;
      return;
    }

    // Validate authentication again before creating reservation
    if (!this.validateAuthentication()) {
      this.isProcessing = false;
      return;
    }

    const payload: CreateReservationPayload = {
      voitureId: this.reservationData.voitureId,
      clientId: this.reservationData.clientId,
      dateDebut: this.reservationData.dateDebut,
      dateFin: this.reservationData.dateFin,
      insuranceOption: this.reservationData.insuranceOption
    };

    console.log('Creating reservation in database:', payload);

    this.reservationService.createReservation(payload)
      .pipe(
        catchError(error => {
          console.error('Error creating reservation:', error);

          // Check if it's an authentication error
          if (error.message && error.message.includes('Authentication failed')) {
            this.authService.logout();
            this.router.navigate(['/login']);
            return of(null);
          }

          this.paymentError = 'Failed to create reservation. Please try again.';
          this.isProcessing = false;
          return of(null);
        })
      )
      .subscribe((reservation: any) => {
        if (reservation) {
          console.log('Reservation created successfully:', reservation);
          // Now process the payment
          this.processPayment(reservation.id);
        } else {
          this.paymentError = 'Failed to create reservation. Please try again.';
          this.isProcessing = false;
        }
      });
  }

  private processPayment(reservationId: number): void {
    const paymentData: PaymentPayload = {
      reservationId: reservationId,
      paymentMethod: this.selectedPaymentMethod,
      amount: this.reservationDetails.total,
      cardDetails: this.selectedPaymentMethod === 'card' ? {
        number: this.cardNumber.replace(/\s/g, ''),
        name: this.cardName,
        expiry: this.expiryDate,
        cvv: this.cvv
      } : undefined
    };

    console.log('Processing payment:', paymentData);

    // For cash payments, we don't need to process payment through the API
    // Just update the reservation status based on payment method
    if (this.selectedPaymentMethod === 'cash') {
      // For cash payments, keep status as Pending (admin will confirm when payment is received)
      console.log('Cash payment selected - reservation will remain Pending for admin confirmation');

      // Store payment method in sessionStorage for success component
      const storedData = sessionStorage.getItem('pendingReservation');
      if (storedData) {
        try {
          const data = JSON.parse(storedData);
          data.paymentMethod = this.selectedPaymentMethod;
          sessionStorage.setItem('pendingReservation', JSON.stringify(data));
        } catch (error) {
          console.error('Error updating stored data:', error);
        }
      }

      // Clear the pending reservation
      sessionStorage.removeItem('pendingReservation');

      // Redirect to success page
      this.router.navigate(['/payment-success']);
      this.isProcessing = false;
      return;
    }

    // For card and PayPal payments, process through API
    this.reservationService.processPayment(paymentData)
      .pipe(
        catchError(error => {
          console.error('Payment processing error:', error);

          // Check if it's an authentication error
          if (error.message && error.message.includes('Authentication failed')) {
            // Try to refresh token or redirect to login
            this.authService.logout();
            this.router.navigate(['/login']);
            return of({ success: false, error: 'Authentication failed. Please log in again.' });
          }

          this.paymentError = error.message || 'Payment processing failed. Please try again.';
          this.isProcessing = false;
          return of({ success: false, error: error.message });
        })
      )
      .subscribe((result: any) => {
        if (result.success) {
          console.log('Payment processed successfully:', result);

          // Store payment method in sessionStorage for success component
          const storedData = sessionStorage.getItem('pendingReservation');
          if (storedData) {
            try {
              const data = JSON.parse(storedData);
              data.paymentMethod = this.selectedPaymentMethod;
              sessionStorage.setItem('pendingReservation', JSON.stringify(data));
            } catch (error) {
              console.error('Error updating stored data:', error);
            }
          }

          // Clear the pending reservation
          sessionStorage.removeItem('pendingReservation');

          // Redirect to success page
          this.router.navigate(['/payment-success']);
        } else {
          this.paymentError = result.error || 'Payment failed. Please try again.';
        }
        this.isProcessing = false;
      });
  }

  // Retry payment processing
  retryPayment(): void {
    this.paymentError = null;
    this.onSubmit();
  }

  // Cancel payment and return to vehicle browser
  cancelPayment(): void {
    sessionStorage.removeItem('pendingReservation');
    this.router.navigate(['/vehicle-browser']);
  }

  // Format currency for display
  formatCurrency(value: number): string {
    return value.toFixed(2) + ' MAD';
  }

  private validateAuthentication(): boolean {
    console.log('=== AUTHENTICATION VALIDATION DEBUG ===');

    if (!this.authService.isLoggedIn()) {
      console.log('AuthService.isLoggedIn() returned false');
      this.paymentError = 'Authentication failed. Please log in again.';
      this.router.navigate(['/login']);
      return false;
    }

    const token = this.authService.getToken();
    console.log('Token retrieved:', token ? 'Token present' : 'No token');

    if (!token) {
      console.log('No token found');
      this.paymentError = 'Authentication failed. Please log in again.';
      this.router.navigate(['/login']);
      return false;
    }

    // Check if token is expired
    try {
      const payload = this.authService.decodeToken(token);
      console.log('Decoded token payload:', payload);

      if (payload && payload.exp) {
        const currentTime = Date.now() / 1000;
        console.log('Token expiration check:', { exp: payload.exp, currentTime, isExpired: payload.exp < currentTime });

        if (payload.exp < currentTime) {
          console.log('Token is expired, logging out');
          this.authService.logout();
          this.paymentError = 'Authentication failed. Please log in again.';
          this.router.navigate(['/login']);
          return false;
        }
      }
    } catch (error) {
      console.error('Error validating token:', error);
      this.authService.logout();
      this.paymentError = 'Authentication failed. Please log in again.';
      this.router.navigate(['/login']);
      return false;
    }

    console.log('Authentication validation successful');
    console.log('=====================================');
    return true;
  }
}
