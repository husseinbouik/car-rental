// src/app/services/reservation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth.service';

export interface Reservation {
  id: number;
  voitureId: number;
  clientId: number;  // Changed from userId to match backend
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
  clientId: number;  // Changed from userId to match backend
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
    const token = localStorage.getItem('access_token') ;
    if (!token) {
      throw new Error('No access token available');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  private formatDateForBackend(dateString: string, isEndDate: boolean = false): string {
    if (!dateString) throw new Error('Date string is required');

    // If already in ISO format with time, return as-is
    if (dateString.includes('T')) {
      return dateString;
    }

    // Add appropriate time component
    return isEndDate
      ? `${dateString}T23:59:59`
      : `${dateString}T00:00:00`;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.status === 403) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (error.error) {
      // Try to extract backend validation messages
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

  createReservation(payload: CreateReservationPayload): Observable<Reservation> {
    try {
      const headers = this.getAuthHeaders();

      const formattedPayload = {
        ...payload,
        dateDebut: this.formatDateForBackend(payload.dateDebut),
        dateFin: this.formatDateForBackend(payload.dateFin, true)
      };

      return this.http.post<Reservation>(this.apiUrl, formattedPayload, { headers }).pipe(
        catchError(this.handleError)
      );
    } catch (error) {
      return throwError(() => error);
    }
  }



  getUserReservations(userId: number): Observable<Reservation[]> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<Reservation[]>(`${this.apiUrl}`, { headers, params }).pipe(
      catchError(this.handleError)
    );
  }

  cancelReservation(reservationId: number): Observable<Reservation> {
    const headers = this.getAuthHeaders();
    const cancelPayload = { status: 'Cancelled' };
    return this.http.patch<Reservation>(`${this.apiUrl}/${reservationId}`, cancelPayload, { headers }).pipe(
      catchError(this.handleError)
    );
  }
}
