import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../reservation.service';
import { Reservation } from '../reservation.model';

@Component({
  selector: 'app-reservation-details',
  standalone:false,
  templateUrl: './reservation-details.component.html',
  styleUrls: ['./reservation-details.component.css']
})
export class ReservationDetailsComponent implements OnInit {
  reservation: Reservation | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    // Fetch the reservation ID from the route parameters
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReservationDetails(+id);
    }
  }

  // Fetch reservation details by ID
  loadReservationDetails(id: number): void {
    this.reservationService.getReservationById(id).subscribe({
      next: (reservation) => {
        this.reservation = reservation;
      },
      error: (error) => {
        console.error('Error fetching reservation details:', error);
      }
    });
  }

  // Navigate back to the reservations list
  goBack(): void {
    this.router.navigate(['/admin/reservations']);
  }
}
