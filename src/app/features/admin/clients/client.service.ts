import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from './client.model'; // Make sure this path is correct
import { environment } from '../../../../environments/environment'; // Adjust path as needed

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  // Define the base API URL from environment variables
  private apiUrl = environment.apiBaseUrl; // e.g., 'http://localhost:8080' or your actual base URL

  constructor(private http: HttpClient) {}

  // --- Helper function to get authentication headers ---
  // Assumes you store the access token in localStorage like in VehicleService
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    console.log('Using token for ClientService:', token);

    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      })
    };
  }

  // --- API Methods ---

  /**
   * GET /api/clients
   * Fetches all clients.
   */
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/api/clients`, this.getAuthHeaders());
  }

  /**
   * GET /api/clients/{id}
   * Fetches a single client by their ID.
   */
  getClientById(id: number | string): Observable<Client> { // Accept string or number for ID flexibility
    return this.http.get<Client>(`${this.apiUrl}/api/clients/${id}`, this.getAuthHeaders());
  }

  /**
   * POST /api/clients
   * Creates a new client.
   * @param client The client data to create (without ID, usually).
   */
  createClient(client: Omit<Client, 'id'> | Client): Observable<Client> {
     // Ensure Content-Type is set for POST requests with a body
     const headers = this.getAuthHeaders().headers.set('Content-Type', 'application/json');
    return this.http.post<Client>(`${this.apiUrl}/api/clients`, client, { headers });
  }

  /**
   * PUT /api/clients/{id}
   * Updates an existing client.
   * @param client The full client object including the ID.
   */
  updateClient(client: Client): Observable<Client> {
    if (!client.id) {
      throw new Error('Client ID is required for update.'); // Basic validation
    }
    // Ensure Content-Type is set for PUT requests with a body
    const headers = this.getAuthHeaders().headers.set('Content-Type', 'application/json');
    return this.http.put<Client>(`${this.apiUrl}/api/clients/${client.id}`, client, { headers });
  }

  /**
   * DELETE /api/clients/{id}
   * Deletes a client by their ID.
   */
  deleteClient(id: number | string): Observable<void> { // DELETE typically returns no body, hence Observable<void>
    return this.http.delete<void>(`${this.apiUrl}/api/clients/${id}`, this.getAuthHeaders());
  }
}
