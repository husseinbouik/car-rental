import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation } from './reservation.model'; // Make sure this path is correct
import { environment } from '../../../../environments/environment'; // Adjust path as needed

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  // Define the base API URL using environment variables
  // This will resolve to something like 'http://localhost:8080/api/reservations'
  private apiUrl = `${environment.apiBaseUrl}/api/reservations`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('access_token'); 
    return {
      headers: new HttpHeaders({
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      })
    };
  }

  // --- API Methods ---

  /**
   * Maps to: GET /api/reservations
   * Fetches all reservations.
   */
  getReservations(): Observable<Reservation[]> {
    console.log(`GET ${this.apiUrl}`); // Optional: Log API call
    return this.http.get<Reservation[]>(this.apiUrl, this.getAuthHeaders());
  }

  /**
   * Maps to: GET /api/reservations/{id}
   * Fetches a single reservation by its ID.
   */
  getReservationById(id: number | string): Observable<Reservation> {
    const url = `${this.apiUrl}/${id}`;
    console.log(`GET ${url}`); // Optional: Log API call
    return this.http.get<Reservation>(url, this.getAuthHeaders());
  }

  /**
   * Maps to: POST /api/reservations
   * Creates a new reservation.
   * @param reservation The reservation data to create.
   */
  createReservation(reservation: Omit<Reservation, 'id'> | Reservation): Observable<Reservation> {
     const headers = this.getAuthHeaders().headers.set('Content-Type', 'application/json');
     console.log(`POST ${this.apiUrl}`, reservation); // Optional: Log API call
    return this.http.post<Reservation>(this.apiUrl, reservation, { headers });
  }

  /**
   * Maps to: PUT /api/reservations/{id}
   * Updates an existing reservation.
   * @param reservation The full reservation object including the ID.
   */
  updateReservation(reservation: Reservation): Observable<Reservation> {
    if (!reservation.id) {
      // Basic validation on the client side
      throw new Error('Reservation ID is required for update.');
    }
    const url = `${this.apiUrl}/${reservation.id}`;
    const headers = this.getAuthHeaders().headers.set('Content-Type', 'application/json');
    console.log(`PUT ${url}`, reservation); // Optional: Log API call
    return this.http.put<Reservation>(url, reservation, { headers });
  }

  /**
   * Maps to: DELETE /api/reservations/{id}
   * Deletes a reservation by its ID.
   */
  deleteReservation(id: number | string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    console.log(`DELETE ${url}`); // Optional: Log API call
    return this.http.delete<void>(url, this.getAuthHeaders());
  }
}
