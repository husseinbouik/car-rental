import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ClientService } from '../client.service';
import { Client } from '../client.model';

@Component({
  selector: 'app-client-details',
  standalone: false,
  templateUrl: './client-details.component.html',
  styleUrls: ['./client-details.component.css']
})
export class ClientDetailsComponent implements OnInit {
  client: Client | undefined;
  isLoading = false;
  errorMessage: string | null = null;
  clientId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.clientId = +idParam;
      if (!isNaN(this.clientId)) {
        this.loadClientDetails(this.clientId);
      } else {
        this.errorMessage = `Invalid Client ID provided: ${idParam}`;
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'No Client ID provided in the route.';
      this.isLoading = false;
    }
  }


  loadClientDetails(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.clientService.getClientById(id)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (clientData) => {
          console.log("Fetched client details:", clientData);
          this.client = clientData;
           if (!this.client) {
             this.errorMessage = `Client with ID ${id} not found.`;
          }
        },
        error: (error) => {
          console.error('Error fetching client details:', error);
          this.errorMessage = `Failed to load client details for ID ${id}. Please try again later.`;
          this.client = undefined;
        }
      });
  }


  goBack(): void {
    this.router.navigate(['/admin/clients']);
  }


  goToEdit(): void {
    if (this.client?.id) {
      this.router.navigate(['/admin/clients/edit', this.client.id]);
    }
  }
}
