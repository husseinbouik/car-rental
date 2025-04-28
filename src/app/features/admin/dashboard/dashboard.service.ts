import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'; // <--- Import environment

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  // Use the base URL from environment
  private baseUrl = environment.apiBaseUrl; // e.g., 'http://localhost:8080'

  // Define the dashboard API prefix
  private dashboardApiPrefix = '/api/dashboard'; // Or '/dashboard' if your backend is only for the dashboard

  // Combine them to get the full dashboard API base URL
  private dashboardApiUrl = `${this.baseUrl}${this.dashboardApiPrefix}`;


  constructor(private http: HttpClient) { }

  // Helper to get authentication headers
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    headers = headers.set('Accept', 'application/json'); // Explicitly ask for JSON
    return headers;
  }

  // Helper for error handling
  private handleError(error: any): Observable<never> {
    console.error('API Error in DashboardService:', error);
    // Use error.message or a more specific property if your backend provides it
    // Check if the error response has a readable body (e.g., JSON with error details)
    let userMessage = 'An unknown error occurred.';
     if (error.error && typeof error.error === 'object') {
        userMessage = error.error.message || JSON.stringify(error.error); // Try to get a message from JSON error body
     } else if (typeof error.error === 'string') {
        userMessage = error.error; // Use string error body if available
     } else if (error.message) {
        userMessage = error.message; // Fallback to the standard HttpErrorResponse message
     }


    return throwError(() => new Error(`Dashboard API request failed: ${userMessage || error.statusText || error}`));
  }

  // --- API Methods ---

  getAvailabilityRate(dateDebut: string, dateFin: string): Observable<number> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams()
      .set('dateDebut', new Date(dateDebut).toISOString())
      .set('dateFin', new Date(dateFin).toISOString());

    // Use the full dashboard API URL + endpoint path
    return this.http.get<number>(`${this.dashboardApiUrl}/taux-disponibilite`, { headers, params }).pipe(
       catchError(this.handleError)
    );
  }

  getCancellationRate(): Observable<number> {
    const headers = this.getAuthHeaders();
     // Use the full dashboard API URL + endpoint path
    return this.http.get<number>(`${this.dashboardApiUrl}/taux-annulation`, { headers }).pipe(
       catchError(this.handleError)
    );
  }

  getTotalRevenue(): Observable<number> {
    const headers = this.getAuthHeaders();
     // Use the full dashboard API URL + endpoint path
    return this.http.get<number>(`${this.dashboardApiUrl}/revenu-total`, { headers }).pipe(
       catchError(this.handleError)
    );
  }

  getRevenueByPeriod(dateDebut: string, dateFin: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams()
      .set('dateDebut', new Date(dateDebut).toISOString())
      .set('dateFin', new Date(dateFin).toISOString());

    // Use the full dashboard API URL + endpoint path
    return this.http.get<any[]>(`${this.dashboardApiUrl}/revenu-par-periode`, { headers, params }).pipe(
       catchError(this.handleError)
    );
  }

  getAverageRevenuePerCar(voitureId: number): Observable<number> {
    const headers = this.getAuthHeaders();
     // Use the full dashboard API URL + endpoint path
    return this.http.get<number>(`${this.dashboardApiUrl}/revenu-moyen-par-voiture/${voitureId}`, { headers }).pipe(
       catchError(this.handleError)
    );
  }

  getReservationsPerCar(voitureId: number): Observable<number> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('voitureId', voitureId.toString());

    // Use the full dashboard API URL + endpoint path
    return this.http.get<number>(`${this.dashboardApiUrl}/nombre-reservations-par-voiture`, { headers, params }).pipe(
       catchError(this.handleError)
    );
  }

  getAverageReservationDuration(): Observable<number> {
    const headers = this.getAuthHeaders();
    // Use the full dashboard API URL + endpoint path
    return this.http.get<number>(`${this.dashboardApiUrl}/duree-moyenne-reservations`, { headers }).pipe(
       catchError(this.handleError)
    );
  }
}
