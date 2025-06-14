import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Reservation } from './reservation.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.apiBaseUrl}/api/reservations`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('access_token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      })
    };
  }

  getReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  getReservationById(id: number): Observable<Reservation> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Reservation>(url, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  createReservation(reservationData: Partial<Reservation>): Observable<Reservation> {
    const payload = this.prepareReservationPayload(reservationData);
    return this.http.post<Reservation>(this.apiUrl, payload, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  updateReservation(id: number, reservationData: Partial<Reservation>): Observable<Reservation> {
    if (!id) {
      return throwError(() => new Error('Reservation ID is required for update.'));
    }
    const url = `${this.apiUrl}/${id}`;
    const payload = this.prepareReservationPayload(reservationData);
    return this.http.put<Reservation>(url, payload, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  deleteReservation(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  private prepareReservationPayload(data: Partial<Reservation>): any {
    console.log('client_id', data.client_id);
    console.log('voiture_id', data.voiture_id);
    return {
      acompte: data.acompte,
      dateDebut: data.dateDebut,
      dateFin: data.dateFin,
      montantTotal: data.montantTotal,
      statut: data.statut,
      clientId:  data.client_id ,
      voitureId: data.voiture_id ,
      conducteurSecondaire: data.conducteur_secondaire_id
        ? { id: data.conducteur_secondaire_id }
        : null
    };
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }
}
