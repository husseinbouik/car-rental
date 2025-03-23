import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReservationService } from '../reservation.service';
import { Reservation } from '../reservation.model';

@Component({
  selector: 'app-reservation-list',
  standalone:false,
  templateUrl: './reservations-list.component.html',
  styleUrls: ['./reservations-list.component.css']
})
export class ReservationListComponent implements OnInit {
  reservations: Reservation[] = [];
  searchTerm: string = '';

  constructor(
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  // Fetch all reservations
  loadReservations(): void {
    this.reservationService.getReservations().subscribe({
      next: (reservations) => (this.reservations = reservations),
      error: (error) => console.error('Error fetching reservations:', error)
    });
  }

  // Navigate to the create reservation page
  createReservation(): void {
    this.router.navigate(['/admin/reservations/create']);
  }

  // Navigate to the edit reservation page
  editReservation(reservation: Reservation): void {
    this.router.navigate(['/admin/reservations/edit', reservation.id]);
  }

  // Delete a reservation
  deleteReservation(reservation: Reservation): void {
    if (confirm('Are you sure you want to delete this reservation?')) {
      this.reservationService.deleteReservation(reservation.id).subscribe({
        next: () => {
          console.log('Reservation deleted successfully');
          this.loadReservations(); // Refresh the list
        },
        error: (error) => console.error('Error deleting reservation:', error)
      });
    }
  }

  // Navigate to the reservation details page
  viewDetails(reservation: Reservation): void {
    this.router.navigate(['/admin/reservations/details', reservation.id]);
  }
}
