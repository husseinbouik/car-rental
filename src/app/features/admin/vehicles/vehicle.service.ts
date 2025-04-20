import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  getAvailableVehicles(): Observable<Voiture[]> {
    return this.http.get<Voiture[]>(`${this.apiUrl}/api/voitures/disponibles`, this.getAuthHeaders());
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
