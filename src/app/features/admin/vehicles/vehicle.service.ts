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

  // Function to get authentication headers
  private getAuthHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      })
    };
  }

  // Fetch all vehicles
  getVehicles(): Observable<Voiture[]> {
    return this.http.get<Voiture[]>(`${this.apiUrl}/api/voitures`, this.getAuthHeaders());
  }

  // Fetch available vehicles
  getAvailableVehicles(): Observable<Voiture[]> {
    return this.http.get<Voiture[]>(`${this.apiUrl}/api/voitures/disponibles`, this.getAuthHeaders());
  }

  // Fetch a single vehicle by ID
  getVehicleById(id: number): Observable<Voiture> {
    return this.http.get<Voiture>(`${this.apiUrl}/api/voitures/${id}`, this.getAuthHeaders());
  }

  // Create a new vehicle
  createVehicle(voiture: Voiture): Observable<Voiture> {
    return this.http.post<Voiture>(`${this.apiUrl}/api/voitures`, voiture, this.getAuthHeaders());
  }

  // Update an existing vehicle
  updateVehicle(voiture: Voiture): Observable<Voiture> {
    return this.http.put<Voiture>(`${this.apiUrl}/api/voitures/${voiture.id}`, voiture, this.getAuthHeaders());
  }

  // Delete a vehicle by ID
  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/voitures/${id}`, this.getAuthHeaders());
  }
}
