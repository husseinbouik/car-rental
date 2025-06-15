// src/app/services/reservation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth.service';

export interface Reservation {
  id: number;
  voitureId: number;
  clientId: number;
  dateDebut: string;
  dateFin: string;
  prixTotal: number;
  status: string;
  insuranceOption: string;
  voiture?: {
    id: number;
    vname: string;
    marque: string;
    modele: string;
    photo?: string;
  };
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
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token available');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    if (error.status === 403) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (error.error) {
      if (error.error.errors) {
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
    return this.http.get<Reservation[]>(`${this.apiUrl}/client/${userId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  createReservation(payload: CreateReservationPayload): Observable<Reservation> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.post<Reservation>(this.apiUrl, payload, { headers }).pipe(
        catchError(this.handleError)
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  cancelReservation(reservationId: number): Observable<Reservation> {
    const headers = this.getAuthHeaders();
    const cancelPayload = { status: 'Cancelled' };
    return this.http.patch<Reservation>(`${this.apiUrl}/${reservationId}`, cancelPayload, { headers }).pipe(
      catchError(this.handleError)
    );
  }
}
