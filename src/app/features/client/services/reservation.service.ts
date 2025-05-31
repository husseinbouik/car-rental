// src/app/services/reservation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Reservation {
  id: number;
  voitureId: number;
  userId: number; // Assuming user ID is part of the reservation data
  dateDebut: string; // ISO string or date format
  dateFin: string;   // ISO string or date format
  prixTotal: number;
  status: string; // e.g., 'Pending', 'Confirmed', 'Cancelled', 'Completed'
  // Add other properties like vehicle details if included in the reservation payload
  voiture?: { // Optional: embed vehicle details
      id: number;
      vname: string;
      marque: string;
      modele: string;
      photo?: string; // Base64 string
      // ... other vehicle details
  };
}

// Define the payload structure for creating a reservation
export interface CreateReservationPayload {
  voitureId: number;
  userId: number; // You'll get this from your AuthService
  dateDebut: string; // YYYY-MM-DD or ISO string
  dateFin: string;   // YYYY-MM-DD or ISO string
  insuranceOption: string; // e.g., 'basic', 'premium'
  // Add other required fields from your backend API
}


@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private apiUrl = environment.apiBaseUrl + '/api/reservations'; // Adjust API path as needed

  constructor(private http: HttpClient) { }

  // Helper to get authentication headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
     headers = headers.set('Accept', 'application/json');
     // For JSON request body, you might also need:
     // headers = headers.set('Content-Type', 'application/json');
    return headers;
  }

  // Helper for error handling
  private handleError(error: any): Observable<never> {
    console.error('API Error in ReservationService:', error);
    // You can add more sophisticated error handling here,
    // like extracting a user-friendly message from error.error
    return throwError(() => new Error(`Reservation API request failed: ${error.message || error}`));
  }

  // Create a new reservation
  createReservation(payload: CreateReservationPayload): Observable<Reservation> {
    const headers = this.getAuthHeaders();
    // Note: If your backend expects JSON, do NOT set Content-Type header
    // as HttpClient will do it automatically for a JSON body.
    // If backend expects FormData, you'd need to handle that differently.
    return this.http.post<Reservation>(this.apiUrl, payload, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Get reservations for the current user
  // Assuming your backend has an endpoint like /api/reservations/my
  // or /api/users/{userId}/reservations
  // We'll use a query parameter for flexibility here: /api/reservations?userId={userId}
  // Adjust the endpoint and parameter name based on your backend API
  getUserReservations(userId: number): Observable<Reservation[]> {
     const headers = this.getAuthHeaders();
     const params = new HttpParams().set('userId', userId.toString()); // Or adjust if your API uses path variable /api/reservations/user/{userId}

    return this.http.get<Reservation[]>(`${this.apiUrl}`, { headers, params }).pipe( // Adjust endpoint here if needed
      catchError(this.handleError)
    );
  }

  // Cancel a reservation
  // Assuming your backend has an endpoint like /api/reservations/{id}/cancel
  // or sends a PUT/PATCH to /api/reservations/{id} with status='Cancelled'
  // We'll use a PATCH request here as an example to update status
  // Adjust method and endpoint based on your backend API
  cancelReservation(reservationId: number): Observable<Reservation> {
     const headers = this.getAuthHeaders();
     // Assuming PATCH /api/reservations/{id} with a body like { status: 'Cancelled' }
     // Or GET /api/reservations/{id}/cancel if it's a specific action endpoint
     // Let's assume PATCH for a status update for now. Adjust if your API is different.
     const cancelPayload = { status: 'Cancelled' }; // Example payload

    return this.http.patch<Reservation>(`${this.apiUrl}/${reservationId}`, cancelPayload, { headers }).pipe(
      catchError(this.handleError)
    );

    // If your API uses a specific endpoint like /api/reservations/{id}/cancel (GET or POST)
    // return this.http.post<Reservation>(`${this.apiUrl}/${reservationId}/cancel`, null, { headers }).pipe( // Or .get
    //   catchError(this.handleError)
    // );
  }
}
