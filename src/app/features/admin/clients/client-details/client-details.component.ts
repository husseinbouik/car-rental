import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ClientService } from '../client.service';
import { Client } from '../client.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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

  // Image URLs for display
  photoCINUrl: SafeUrl | null = null;
  photoPermisUrl: SafeUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private sanitizer: DomSanitizer
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
          this.client = clientData;

          // Load CIN photo if available
          this.loadCinPhoto(id);

          // Load permis photo if available
          this.loadPermisPhoto(id);

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

  loadCinPhoto(id: number): void {
    this.clientService.getCinPhoto(id).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.photoCINUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      },
      error: (error) => {
        console.error('Error loading CIN photo:', error);
        this.photoCINUrl = null;
      }
    });
  }

  loadPermisPhoto(id: number): void {
    this.clientService.getPermisPhoto(id).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.photoPermisUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      },
      error: (error) => {
        console.error('Error loading permis photo:', error);
        this.photoPermisUrl = null;
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

  // Clean up object URLs when component is destroyed
  ngOnDestroy(): void {
    if (this.photoCINUrl) {
      URL.revokeObjectURL(this.photoCINUrl.toString());
    }
    if (this.photoPermisUrl) {
      URL.revokeObjectURL(this.photoPermisUrl.toString());
    }
  }
}
