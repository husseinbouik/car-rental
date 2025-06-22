// src/app/services/reservation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth.service';
import { Voiture } from '../../admin/vehicles/vehicle.model';

export interface Reservation {
  id: number;
  voitureId: number;
  clientId: number;
  dateDebut: string;
  dateFin: string;
  montantTotal: number;
  acompte: number;
  statut: string;
  insuranceOption: string;
  voiture?: Voiture;
  client?: any;
  conducteurSecondaire?: any;
}

export interface CreateReservationPayload {
  voitureId: number;
  clientId: number;
  dateDebut: string;
  dateFin: string;
  insuranceOption: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = environment.apiBaseUrl + '/api/reservations';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headersConfig: { [name: string]: string } = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headersConfig);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.status === 401 || error.status === 403) {
      errorMessage = 'Authentication failed. Please log in again.';
      // Don't automatically logout, just return the error
    } else if (error.error) {
      if (typeof error.error === 'string' && error.error.includes('is not valid JSON')) {
          errorMessage = 'Failed to parse server response. The data from the backend is not valid JSON.';
      } else if (error.error.errors) {
        errorMessage = Object.values(error.error.errors).join('\n');
      } else if (error.error.message) {
        errorMessage = error.error.message;
      }
    } else {
      errorMessage = error.message || error.statusText;
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  getUserReservations(userId: number): Observable<Reservation[]> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/user/${userId}`, { headers, responseType: 'text' }).pipe(
      map(text => {
        let correctedText = text;
        if (text.includes('"missions":]')) {
          console.warn('Malformed JSON detected from backend ("missions":]). Applying client-side fix.');
          correctedText = text.replace(/"missions":]/g, '"missions":[]');
        }

        const data = JSON.parse(correctedText);

        if (data && !Array.isArray(data)) {
          console.warn('API returned a single object for a list endpoint. Wrapping it in an array.');
          return [data];
        }

        return data;
      }),
      catchError(this.handleError.bind(this))
    );
  }

  createReservation(payload: CreateReservationPayload): Observable<Reservation> {
    const headers = this.getAuthHeaders();
    const token = this.authService.getToken();

    console.log('=== RESERVATION CREATION DEBUG ===');
    console.log('Payload:', payload);
    console.log('Token:', token);

    // Get client_id from token instead of payload
    let clientId = payload.clientId;
    if (token) {
      try {
        const decodedPayload = this.authService.decodeToken(token);
        console.log('Decoded token payload:', decodedPayload);
        console.log('Authorities:', decodedPayload?.authorities);
        console.log('User ID:', decodedPayload?.user_id);
        console.log('Client ID from token:', decodedPayload?.client_id);

        // Use client_id from token if available
        if (decodedPayload?.client_id) {
          clientId = decodedPayload.client_id;
          console.log('Using client_id from token:', clientId);
        }
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }

    // Create updated payload with correct client_id
    const updatedPayload = {
      ...payload,
      clientId: clientId
    };

    console.log('Updated payload with client_id:', updatedPayload);
    console.log('Headers being sent:', headers);
    console.log('Request URL:', this.apiUrl);
    console.log('================================');

    return this.http.post<Reservation>(this.apiUrl, updatedPayload, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  cancelReservation(reservationId: number): Observable<Reservation> {
    const headers = this.getAuthHeaders();
    const cancelPayload = { status: 'Cancelled' };
    return this.http.patch<Reservation>(`${this.apiUrl}/${reservationId}`, cancelPayload, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}
