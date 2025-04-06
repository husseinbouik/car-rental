import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../reservation.service';
import { ClientService } from '../../clients/client.service';
import { VehicleService } from '../../vehicles/vehicle.service';
import { Router, ActivatedRoute } from '@angular/router';
import { formatDate } from '@angular/common';
import { Reservation } from '../reservation.model';

@Component({
  selector: 'app-reservation-create',
  standalone: false, // Set to true if using standalone components
  templateUrl: './reservation-create.component.html',
  styleUrls: ['./reservation-create.component.css']
})
export class ReservationCreateComponent implements OnInit {
  reservation: Partial<Reservation> = {
    acompte: 0,
    dateDebut: this.formatDateForInput(new Date()),
    dateFin: this.formatDateForInput(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    montantTotal: 0,
    statut: 'Pending',
    client_id: 0,
    voiture_id: 0,
    conducteur_secondaire_id: 0
  };

  clients: any[] = [];
  cars: any[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  isEditMode = false;
  reservationId: number | null = null;
  pageTitle = 'Create New Reservation';
  submitButtonText = 'Create Reservation';

  constructor(
    private reservationService: ReservationService,
    private clientService: ClientService,
    private vehicleService: VehicleService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadClients();
    this.loadCars();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && !isNaN(+idParam)) {
      this.isEditMode = true;
      this.reservationId = +idParam;
      this.pageTitle = 'Edit Reservation';
      this.submitButtonText = 'Update Reservation';
      this.loadReservationData(this.reservationId);
    }
  }

  loadReservationData(id: number): void {
    this.isLoading = true;
    this.reservationService.getReservationById(id).subscribe({
      next: (data) => {
        this.reservation = {
          ...data,
          dateDebut: this.formatDateForInput(data.dateDebut),
          dateFin: this.formatDateForInput(data.dateFin),
          client_id: data.client_id,
          voiture_id: data.voiture_id,
          conducteur_secondaire_id: data.conducteur_secondaire_id || 0
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading reservation:', err);
        this.errorMessage = 'Failed to load reservation data';
        this.isLoading = false;
        this.router.navigate(['/admin/reservations']);
      }
    });
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (clients) => this.clients = clients,
      error: (err) => {
        console.error('Error loading clients:', err);
        this.errorMessage = 'Failed to load clients. Please try again later.';
      }
    });
  }

  loadCars(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (cars) => this.cars = cars,
      error: (err) => {
        console.error('Error loading cars:', err);
        this.errorMessage = 'Failed to load available cars. Please try again later.';
      }
    });
  }

  formatDateForInput(dateValue: string | Date): string {
    try {
      const date = new Date(dateValue);
      return formatDate(date, 'yyyy-MM-ddTHH:mm', 'en-US');
    } catch (e) {
      console.error("Error formatting date:", e);
      return '';
    }
  }

  onSubmit(): void {
    if (this.isLoading) return;

    this.errorMessage = null;

    if (!this.reservation.client_id || !this.reservation.voiture_id) {
      this.errorMessage = 'Please select both a client and a car';
      return;
    }

    try {
      this.reservation.dateDebut = new Date(this.reservation.dateDebut!).toISOString();
      this.reservation.dateFin = new Date(this.reservation.dateFin!).toISOString();
    } catch (e) {
      this.errorMessage = 'Invalid date format. Please check your dates.';
      return;
    }

    const startDate = new Date(this.reservation.dateDebut);
    const endDate = new Date(this.reservation.dateFin);

    if (startDate >= endDate) {
      this.errorMessage = 'End date must be after start date';
      return;
    }

    this.isLoading = true;

    const operation = this.isEditMode && this.reservationId
      ? this.reservationService.updateReservation(this.reservationId, this.reservation)
      : this.reservationService.createReservation(this.reservation);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/admin/reservations'], {
          state: {
            successMessage: `Reservation ${this.isEditMode ? 'updated' : 'created'} successfully!`
          }
        });
      },
      error: (err) => {
        console.error('Error saving reservation:', err);
        this.errorMessage = err.message || 'Failed to save reservation. Please try again.';
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/reservations']);
  }
}
