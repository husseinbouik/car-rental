import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../client.service';
import { Client } from '../client.model';

@Component({
  selector: 'app-client-details',
  standalone:false,
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.css']
})
export class ClientDetailsComponent implements OnInit {
  client: Client | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    // Fetch the client ID from the route parameters
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClientDetails(+id);
    }
  }

  // Fetch client details by ID
  loadClientDetails(id: number): void {
    this.clientService.getClientById(id).subscribe({
      next: (client) => {
        this.client = client;
      },
      error: (error) => {
        console.error('Error fetching client details:', error);
      }
    });
  }

  // Navigate back to the clients list
  goBack(): void {
    this.router.navigate(['/admin/clients']);
  }
}
