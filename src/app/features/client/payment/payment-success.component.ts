import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    FontAwesomeModule
  ],
  template: `
    <div class="min-h-[80vh] flex items-center justify-center p-6">
      <div class="max-w-md w-full text-center">
        <fa-icon [icon]="faCheckCircle" class="text-6xl text-green-500 mb-6"></fa-icon>
        <h1 class="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          {{ getTitle() }}
        </h1>
        <p class="text-gray-600 dark:text-gray-300 mb-8">
          {{ getMessage() }}
        </p>
        <div class="space-y-4">
          <a routerLink="/my-reservations"
             class="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200">
            View My Reservations
          </a>
          <a routerLink="/vehicle-browser"
             class="block w-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white py-3 px-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
            Browse More Vehicles
          </a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PaymentSuccessComponent implements OnInit {
  faCheckCircle = faCheckCircle;
  paymentMethod: string = 'card';

  ngOnInit(): void {
    // Get payment method from sessionStorage if available
    const storedData = sessionStorage.getItem('pendingReservation');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        // You can store payment method in sessionStorage when processing payment
        this.paymentMethod = data.paymentMethod || 'card';
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }
  }

  getTitle(): string {
    if (this.paymentMethod === 'cash') {
      return 'Reservation Created!';
    }
    return 'Payment Successful!';
  }

  getMessage(): string {
    if (this.paymentMethod === 'cash') {
      return 'Your reservation has been created successfully. Please pay with cash when you pick up your vehicle. You will receive a confirmation email shortly.';
    }
    return 'Thank you for your payment. Your reservation has been confirmed and you will receive a confirmation email shortly.';
  }
}
