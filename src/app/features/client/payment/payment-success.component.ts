import { Component } from '@angular/core';
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
          {{ 'payment.success' | translate }}
        </h1>
        <p class="text-gray-600 dark:text-gray-300 mb-8">
          {{ 'payment.success_message' | translate }}
        </p>
        <div class="space-y-4">
          <a routerLink="/my-reservations"
             class="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200">
            {{ 'payment.view_reservations' | translate }}
          </a>
          <a routerLink="/vehicles"
             class="block w-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white py-3 px-6 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
            {{ 'payment.browse_more' | translate }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PaymentSuccessComponent {
  faCheckCircle = faCheckCircle;
}
