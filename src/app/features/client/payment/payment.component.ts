import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

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
  selectedPaymentMethod: 'card' | 'paypal' = 'card';
  cardNumber: string = '';
  cardName: string = '';
  expiryDate: string = '';
  cvv: string = '';
  isProcessing: boolean = false;

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

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check if user is logged in (simple check for static demo)
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Get reservation data from sessionStorage
    const storedData = sessionStorage.getItem('pendingReservation');
    if (!storedData) {
      this.router.navigate(['/vehicles']);
      return;
    }

    try {
      this.reservationData = JSON.parse(storedData);
      this.calculateReservationDetails();
    } catch (error) {
      console.error('Error parsing reservation data:', error);
      this.router.navigate(['/vehicles']);
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

    // Static pricing calculation
    const basePrice = (vehicle.prixDeBase || 60) * daysDiff;
    const insurancePrice = this.reservationData.insuranceOption === 'premium' ? 25 * daysDiff : 15 * daysDiff;
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

  onPaymentMethodChange(method: 'card' | 'paypal'): void {
    this.selectedPaymentMethod = method;
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim();
    this.cardNumber = formattedValue;
  }

  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.expiryDate = value;
  }

  onSubmit(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    console.log('Processing payment...');

    // Simulate payment processing delay
    setTimeout(() => {
      // Create a mock reservation
      const mockReservation = {
        id: Math.floor(Math.random() * 10000) + 1000,
        voitureId: this.reservationData?.voitureId,
        clientId: this.reservationData?.clientId,
        dateDebut: this.reservationData?.dateDebut,
        dateFin: this.reservationData?.dateFin,
        status: 'Confirmed',
        prixTotal: this.reservationDetails.total,
        voiture: this.reservationData?.vehicle
      };

      // Store the reservation in localStorage for the my-reservations component
      const existingReservations = JSON.parse(localStorage.getItem('userReservations') || '[]');
      existingReservations.push(mockReservation);
      localStorage.setItem('userReservations', JSON.stringify(existingReservations));

      // Clear the pending reservation
      sessionStorage.removeItem('pendingReservation');

      // Redirect to success page
      this.router.navigate(['/payment-success']);
    }, 2000);
  }
}
