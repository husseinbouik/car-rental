import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Client } from './client.model';
import { MOCK_CLIENTS } from './mock-clients';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  // Use mock data instead of HTTP requests
  getClients(): Observable<Client[]> {
    return of(MOCK_CLIENTS);
  }

  getClientById(id: number): Observable<Client | undefined> {
    const client = MOCK_CLIENTS.find(c => c.id === id);
    return of(client);
  }

  createClient(client: Client): Observable<Client> {
    const newClient = { ...client, id: Math.max(...MOCK_CLIENTS.map(c => c.id)) + 1 };
    MOCK_CLIENTS.push(newClient);
    return of(newClient);
  }

  updateClient(client: Client): Observable<Client> {
    const index = MOCK_CLIENTS.findIndex(c => c.id === client.id);
    if (index !== -1) {
      MOCK_CLIENTS[index] = client;
    }
    return of(client);
  }

  deleteClient(id: number): Observable<void> {
    const index = MOCK_CLIENTS.findIndex(c => c.id === id);
    if (index !== -1) {
      MOCK_CLIENTS.splice(index, 1);
    }
    return of(undefined);
  }
}
