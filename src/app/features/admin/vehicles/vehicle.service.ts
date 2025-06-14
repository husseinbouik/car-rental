import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import { Voiture } from './vehicle.model'; // Make sure this model is appropriate or define one locally
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(includeContentType: boolean = true) {
    let headersConfig: { [name: string]: string | string[] } = {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    };
    if (includeContentType) {
      // headersConfig['Content-Type'] = 'application/json'; // Usually for POST/PUT with JSON body
    }
    return {
      headers: new HttpHeaders(headersConfig)
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
    const authHeadersOptions = this.getAuthHeaders();
    const params = new HttpParams()
      .set('dateDebut', new Date(dateDebut).toISOString())
      .set('dateFin', new Date(dateFin).toISOString());

    return this.http.get<Voiture[]>(
      `${this.apiUrl}/api/voitures/disponibles`,
      {
        headers: authHeadersOptions.headers,
        params,
        // withCredentials: true // Only if your backend uses session cookies and requires this
      }
    ).pipe(
      catchError(error => {
        console.error('API Error fetching available vehicles:', error);
        return throwError(() => new Error(
          error.error?.message || 'Failed to fetch available vehicles'
        ));
      })
    );
  }

  getVehicleById(id: number): Observable<Voiture> {
    return this.http.get<Voiture>(`${this.apiUrl}/api/voitures/${id}`, this.getAuthHeaders());
  }

  // NEW METHOD to get vehicle photo
  getVehiclePhoto(id: number): Observable<Blob> {
    const authHeadersOptions = this.getAuthHeaders(false); // No 'Content-Type' needed for GETting a blob
    return this.http.get(`${this.apiUrl}/api/voitures/${id}/photo`, {
      headers: authHeadersOptions.headers,
      responseType: 'blob' // Important: expect a Blob response
    }).pipe(
      catchError(error => {
        console.error(`API Error fetching photo for vehicle ${id}:`, error);
        return throwError(() => new Error(
          error.error?.message || `Failed to fetch photo for vehicle ${id}`
        ));
      })
    );
  }

  createVehicle(formData: FormData): Observable<Voiture> {
    // For FormData, HttpClient usually sets Content-Type automatically (multipart/form-data)
    // So, we might not need to set it explicitly.
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      // 'Accept': 'application/json' // If you expect JSON response
    });
    return this.http.post<Voiture>(`${this.apiUrl}/api/voitures`, formData, { headers });
  }

  updateVehicle(id: number, formData: FormData): Observable<Voiture> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      // 'Accept': 'application/json'
    });
    return this.http.put<Voiture>(`${this.apiUrl}/api/voitures/${id}`, formData, { headers });
  }

  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/voitures/${id}`, this.getAuthHeaders());
  }
}
