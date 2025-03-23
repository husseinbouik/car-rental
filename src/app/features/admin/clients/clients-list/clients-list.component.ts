import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientService } from '../client.service';
import { Client } from '../client.model';

@Component({
  selector: 'app-client-list',
  standalone:false,
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.css']
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  searchTerm: string = '';

  constructor(
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  // Fetch all clients
  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (clients) => (this.clients = clients),
      error: (error) => console.error('Error fetching clients:', error)
    });
  }

  // Navigate to the create client page
  createClient(): void {
    this.router.navigate(['/admin/clients/create']);
  }

  // Navigate to the edit client page
  editClient(client: Client): void {
    this.router.navigate(['/admin/clients/edit', client.id]);
  }

  // Delete a client
  deleteClient(client: Client): void {
    if (confirm('Are you sure you want to delete this client?')) {
      this.clientService.deleteClient(client.id).subscribe({
        next: () => {
          console.log('Client deleted successfully');
          this.loadClients(); // Refresh the list
        },
        error: (error) => console.error('Error deleting client:', error)
      });
    }
  }

  // Navigate to the client details page
  viewDetails(client: Client): void {
    this.router.navigate(['/admin/clients/details', client.id]);
  }
}
