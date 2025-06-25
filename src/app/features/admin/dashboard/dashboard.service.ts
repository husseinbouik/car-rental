import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'; // <--- Import environment
import { isPlatformBrowser } from '@angular/common';

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

  // Flag to use mock data when API is not available
  private useMockData = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  // Helper to safely access localStorage
  private getLocalStorage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }

  // Helper to get authentication headers
  private getAuthHeaders(): HttpHeaders {
    const storage = this.getLocalStorage();
    const token = storage ? storage.getItem('access_token') : null;
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

    // If it's a network error or API is not available, switch to mock data
    if (error.status === 0 || error.status === 404 || error.status === 500) {
      console.warn('API not available, switching to mock data');
      this.useMockData = true;
    }

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

  // Helper to get mock data
  private getMockRevenueByPeriod(dateDebut: string, dateFin: string): any[] {
    const startDate = new Date(dateDebut);
    const endDate = new Date(dateFin);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const mockData = [];
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      mockData.push({
        date: currentDate.toISOString(),
        revenue: Math.floor(Math.random() * 1000) + 500 // Random revenue between 500-1500
      });
    }

    return mockData;
  }

  // --- API Methods ---

  getAvailabilityRate(dateDebut: string, dateFin: string): Observable<number> {
    if (this.useMockData) {
      return of(Math.random() * 0.3 + 0.7); // Mock availability rate between 70-100%
    }

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
    if (this.useMockData) {
      return of(Math.random() * 0.15 + 0.05); // Mock cancellation rate between 5-20%
    }

    const headers = this.getAuthHeaders();
     // Use the full dashboard API URL + endpoint path
    return this.http.get<number>(`${this.dashboardApiUrl}/taux-annulation`, { headers }).pipe(
       catchError(this.handleError)
    );
  }

  getTotalRevenue(): Observable<number> {
    if (this.useMockData) {
      return of(Math.floor(Math.random() * 50000) + 25000); // Mock total revenue between 25k-75k
    }

    const headers = this.getAuthHeaders();
     // Use the full dashboard API URL + endpoint path
    return this.http.get<number>(`${this.dashboardApiUrl}/revenu-total`, { headers }).pipe(
       catchError(this.handleError)
    );
  }

  getRevenueByPeriod(dateDebut: string, dateFin: string): Observable<any[]> {
    if (this.useMockData) {
      return of(this.getMockRevenueByPeriod(dateDebut, dateFin));
    }

    const headers = this.getAuthHeaders();
    const params = new HttpParams()
      .set('dateDebut', new Date(dateDebut).toISOString())
      .set('dateFin', new Date(dateFin).toISOString());

    // Use the full dashboard API URL + endpoint path
    return this.http.get<any[]>(`${this.dashboardApiUrl}/revenu-par-periode`, { headers, params }).pipe(
       map(data => {
         // Ensure we always return an array
         if (!Array.isArray(data)) {
           console.warn('API returned non-array data, using mock data instead');
           return this.getMockRevenueByPeriod(dateDebut, dateFin);
         }
         return data;
       }),
       catchError(this.handleError)
    );
  }

  getAverageRevenuePerCar(voitureId: number): Observable<number> {
    if (this.useMockData) {
      return of(Math.floor(Math.random() * 2000) + 1000); // Mock average revenue per car between 1k-3k
    }

    const headers = this.getAuthHeaders();
     // Use the full dashboard API URL + endpoint path
    return this.http.get<number>(`${this.dashboardApiUrl}/revenu-moyen-par-voiture/${voitureId}`, { headers }).pipe(
       catchError(this.handleError)
    );
  }

  getReservationsPerCar(voitureId: number): Observable<number> {
    if (this.useMockData) {
      return of(Math.floor(Math.random() * 20) + 5); // Mock reservations per car between 5-25
    }

    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('voitureId', voitureId.toString());

    // Use the full dashboard API URL + endpoint path
    return this.http.get<number>(`${this.dashboardApiUrl}/nombre-reservations-par-voiture`, { headers, params }).pipe(
       catchError(this.handleError)
    );
  }

  getAverageReservationDuration(): Observable<number> {
    if (this.useMockData) {
      return of(Math.random() * 5 + 2); // Mock average duration between 2-7 days
    }

    const headers = this.getAuthHeaders();
    // Use the full dashboard API URL + endpoint path
    return this.http.get<number>(`${this.dashboardApiUrl}/duree-moyenne-reservations`, { headers }).pipe(
       catchError(this.handleError)
    );
  }
}
