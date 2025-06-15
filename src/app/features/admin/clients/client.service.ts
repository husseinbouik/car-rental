// src/app/features/clients/client.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Client } from './client.model';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/api/clients`, this.getAuthHeaders());
  }

  getClientById(id: number | string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/api/clients/${id}`, this.getAuthHeaders());
  }
  getClientByUserId(userId: number | string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/api/clients/user/${userId}`, this.getAuthHeaders());
  }

  createClient(formData: FormData): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}/api/clients`, formData, this.getAuthHeaders());
  }

  updateClient(id: number, formData: FormData): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/api/clients/${id}`, formData, this.getAuthHeaders());
  }

  deleteClient(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/clients/${id}`, this.getAuthHeaders());
  }

  // Add these new methods for fetching photos
  getCinPhoto(id: number | string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/api/clients/${id}/photo-cin`, {
      ...this.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  getPermisPhoto(id: number | string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/api/clients/${id}/photo-permis`, {
      ...this.getAuthHeaders(),
      responseType: 'blob'
    });
  }
}
