import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import { Voiture } from './vehicle.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      })
    };
  }

  getVehicles(): Observable<Voiture[]> {
    return this.http.get<Voiture[]>(`${this.apiUrl}/api/voitures`, this.getAuthHeaders());
  }

getAvailableVehicles(dateDebut: string, dateFin: string): Observable<Voiture[]> {
  if (!dateDebut || !dateFin) {
    console.warn('Cannot fetch available vehicles without dates');
    return of([]);
  }

  // Get complete auth headers (not just headers object)
  const authHeaders = this.getAuthHeaders();

  // Create params with proper encoding
  const params = new HttpParams()
    .set('dateDebut', new Date(dateDebut).toISOString())
    .set('dateFin', new Date(dateFin).toISOString());

  console.log('Making request to:', `${this.apiUrl}/api/voitures/disponibles`);
  console.log('With params:', params.toString());
  console.log('With headers:', authHeaders.headers);

  return this.http.get<Voiture[]>(
    `${this.apiUrl}/api/voitures/disponibles`,
    {
      headers: authHeaders.headers,
      params,
      withCredentials: true // Add this if using cookies/session
    }
  ).pipe(
    catchError(error => {
      console.error('API Error:', error);
      if (error.status === 403) {
        console.error('Permission denied - check your auth token');
        // Optionally redirect to login
        // this.router.navigate(['/login']);
      }
      return throwError(() => new Error(
        error.error?.message ||
        'Failed to fetch available vehicles'
      ));
    })
  );
}

  getVehicleById(id: number): Observable<Voiture> {
    return this.http.get<Voiture>(`${this.apiUrl}/api/voitures/${id}`, this.getAuthHeaders());
  }

  createVehicle(formData: FormData): Observable<Voiture> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    });
    return this.http.post<Voiture>(`${this.apiUrl}/api/voitures`, formData, { headers });
  }

  updateVehicle(id: number, formData: FormData): Observable<Voiture> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    });
    return this.http.put<Voiture>(`${this.apiUrl}/api/voitures/${id}`, formData, { headers });
  }

  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/voitures/${id}`, this.getAuthHeaders());
  }
}
