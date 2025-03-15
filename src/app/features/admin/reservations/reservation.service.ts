import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Reservation } from './reservation.model';
import { MOCK_RESERVATIONS } from './mock-reservations';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  constructor() {}

  getReservations(): Observable<Reservation[]> {
    return of(MOCK_RESERVATIONS);
  }

  getReservationById(id: number): Observable<Reservation | undefined> {
    const reservation = MOCK_RESERVATIONS.find(r => r.id === id);
    return of(reservation);
  }

  createReservation(reservation: Reservation): Observable<Reservation> {
    const newId = Math.max(...MOCK_RESERVATIONS.map(r => r.id)) + 1;
    const newReservation = { ...reservation, id: newId };
    MOCK_RESERVATIONS.push(newReservation);
    return of(newReservation);
  }

  updateReservation(reservation: Reservation): Observable<Reservation> {
    const index = MOCK_RESERVATIONS.findIndex(r => r.id === reservation.id);
    if (index !== -1) {
      MOCK_RESERVATIONS[index] = reservation;
    }
    return of(reservation);
  }

  deleteReservation(id: number): Observable<void> {
    const index = MOCK_RESERVATIONS.findIndex(r => r.id === id);
    if (index !== -1) {
      MOCK_RESERVATIONS.splice(index, 1);
    }
    return of(undefined);
  }
}
