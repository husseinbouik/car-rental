import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReservationService } from '../reservation.service';
import { Reservation } from '../reservation.model';
@Component({
  selector: 'app-reservation-create',
    standalone: false,

  templateUrl: './reservation-create.component.html',
  styleUrl: './reservation-create.component.css'
})
export class ReservationCreateComponent {
  reservation: Reservation = {
    id: 0, // Will be auto-generated
    acompte: 0,
    date_debut: '', // ISO format: 'YYYY-MM-DDTHH:mm:ss'
    date_fin: '',
    montant_total: 0,
    statut: '',
    client_id: 0,
    conducteur_secondaire_id: 0,
    voiture_id: 0
  };

  constructor(
    private reservationService: ReservationService,
    private router: Router
  ) {}

  // Handle form submission
  onSubmit(): void {
    this.reservationService.createReservation(this.reservation).subscribe({
      next: (response) => {
        console.log('Reservation created successfully:', response);
        this.router.navigate(['/admin/reservations']); // Navigate back to the reservations list
      },
      error: (error) => {
        console.error('Error creating reservation:', error);
      }
    });
  }
}
