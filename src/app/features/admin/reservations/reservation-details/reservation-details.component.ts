import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ReservationService } from '../reservation.service';
import { Reservation } from '../reservation.model';

@Component({
  selector: 'app-reservation-details',
  standalone: false,
  templateUrl: './reservation-details.component.html',
  styleUrls: ['./reservation-details.component.css']
})
export class ReservationDetailsComponent implements OnInit {
  reservation: Reservation | undefined;
  isLoading = false;
  errorMessage: string | null = null;
  reservationId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.reservationId = +idParam;
      if (!isNaN(this.reservationId)) {
        this.loadReservationDetails(this.reservationId);
      } else {
        this.errorMessage = `Invalid Reservation ID provided: ${idParam}`;
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'No Reservation ID provided in the route.';
      this.isLoading = false;
    }
  }


  loadReservationDetails(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.reservationService.getReservationById(id)
      .pipe(

        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (reservationData) => {
          console.log("Fetched reservation details:", reservationData);

          this.reservation = reservationData;
          if (!this.reservation) {

              this.errorMessage = `Reservation with ID ${id} not found.`;
          }
        },
        error: (error) => {
          console.error('Error fetching reservation details:', error);

          this.errorMessage = `Failed to load reservation details for ID ${id}. Please try again later or check if the reservation exists.`;
          this.reservation = undefined;
        }
      });
  }


  goBack(): void {
    this.router.navigate(['/admin/reservations']);
  }


  goToEdit(): void {
    if (this.reservation?.id) {
      this.router.navigate(['/admin/reservations/edit', this.reservation.id]); 
    }
  }
}
