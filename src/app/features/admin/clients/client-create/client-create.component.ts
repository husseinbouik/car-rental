// src/app/features/clients/client-create/client-create.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators'; // Import finalize operator
import { ClientService } from '../client.service'; // Ensure path is correct
import { Client } from '../client.model';       // Ensure path is correct
import { HttpErrorResponse } from '@angular/common/http'; // For detailed error handling

@Component({
  selector: 'app-client-create',
  standalone: false, // Or true if using standalone
  templateUrl: './client-create.component.html', // Assuming this matches the improved HTML
  styleUrls: ['./client-create.component.css']
})
export class ClientCreateComponent implements OnInit {

  // Initialize client with default/empty values
  client: Client = {
    id: 0, // Or null if your backend handles null IDs for creation
    cinDelivreLe: '',
    permisDelivreAu: '',
    permisDelivreLe: '',
    adresse: '',
    adresseEtranger: '',
    cin: '',
    cname: '',
    delivreLePasseport: '',
    nationalite: '',
    passeport: '',
    permis: '',
    tel: ''
  };

  isEditMode = false;
  isLoading = false;
  errorMessage: string | null = null;
  pageTitle = 'Create New Client'; // Dynamic title
  submitButtonText = 'Create Client'; // Dynamic button text
  clientId: number | null = null; // Store ID for editing

  constructor(
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isLoading = true; // Start loading indicator immediately
    this.errorMessage = null;
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.clientId = +idParam; // Convert param to number
      if (!isNaN(this.clientId)) {
        // --- Edit Mode ---
        this.isEditMode = true;
        this.pageTitle = 'Edit Client';
        this.submitButtonText = 'Save Changes';
        this.loadClientData(this.clientId); // Fetch existing data
      } else {
        // Invalid ID parameter
        this.errorMessage = `Invalid Client ID provided in URL: ${idParam}`;
        this.isLoading = false; // Stop loading
      }
    } else {
      // --- Create Mode ---
      this.isEditMode = false;
      this.pageTitle = 'Create New Client';
      this.submitButtonText = 'Create Client';
      this.isLoading = false; // No data to load in create mode
    }
  }

  /**
   * Fetches client data for editing.
   * Handles loading state and errors.
   */
  loadClientData(id: number): void {
    this.isLoading = true; // Ensure loading is true when fetching
    this.errorMessage = null;
    this.clientService.getClientById(id)
      .pipe(
        finalize(() => this.isLoading = false) // Stop loading when done/error
      )
      .subscribe({
        next: (data) => {
          if (data) {
            // Format date strings (YYYY-MM-DDTHH:mm:ss...) to YYYY-MM-DD for date inputs
            this.client = {
                ...data,
                cinDelivreLe: this.formatDateForInput(data.cinDelivreLe),
                permisDelivreLe: this.formatDateForInput(data.permisDelivreLe),
                // Keep other fields as they are
            };
             console.log("Loaded client data:", this.client);
          } else {
             this.errorMessage = `Client with ID ${id} not found.`;
             // Optionally navigate back or disable form
          }
        },
        error: (err) => {
          console.error('Error fetching client:', err);
          this.errorMessage = `Failed to load client data (ID: ${id}). Please try again.`;
          // Optionally navigate back
          // this.router.navigate(['/admin/clients']);
        }
      });
  }

   /**
   * Formats a potential date string (like ISO) into 'yyyy-MM-dd' for date input binding.
   * Returns the original string if it's not a valid date or already formatted.
   */
   formatDateForInput(dateString: string | null | undefined): string {
    if (!dateString) {
        return '';
    }
    try {
        // Check if it's likely already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            // Valid date parsed, format it
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    } catch (e) {
        console.warn("Could not format date string for input:", dateString, e);
    }
    // Return empty or original string if formatting failed or wasn't needed
    return dateString;
}


  /**
   * Handles form submission for creating or updating a client.
   */
  onSubmit(): void {
    this.isLoading = true; // Set loading state
    this.errorMessage = null; // Clear previous errors

    // ** Important: Before sending, ensure date formats match backend expectations **
    // If backend expects simple 'YYYY-MM-DD', the current model values might be fine.
    // If backend expects full ISO strings, you might need to convert back here.
    // Assuming backend handles 'YYYY-MM-DD' strings directly for date fields:
    const clientDataToSend = { ...this.client };


    const operation = this.isEditMode
      ? this.clientService.updateClient(clientDataToSend) // Assumes updateClient takes the whole Client object
      : this.clientService.createClient(clientDataToSend);

    operation
      .pipe(
        finalize(() => this.isLoading = false) // Stop loading indicator
      )
      .subscribe({
        next: (response) => {
          console.log(`Client ${this.isEditMode ? 'updated' : 'created'} successfully`, response);
          // Navigate back to the list with a potential success message
          this.router.navigate(['/admin/clients'], { // Adjust route as necessary
            state: { successMessage: `Client ${this.isEditMode ? 'updated' : 'created'} successfully!` }
          });
        },
        error: (err: HttpErrorResponse) => {
          console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} client:`, err);
          // Extract meaningful error message
           if (err.error && typeof err.error === 'string' && err.status !== 500) {
               this.errorMessage = err.error;
           } else if (err.error && err.error.message) {
               this.errorMessage = err.error.message;
           } else {
               this.errorMessage = `Failed to ${this.isEditMode ? 'update' : 'create'} client. Status: ${err.status} - ${err.statusText || 'Unknown error'}.`;
           }
        }
      });
  }

  /**
   * Navigates the user back to the client list view.
   */
   cancel(): void {
    this.router.navigate(['/admin/clients']); // Adjust route as necessary
  }
}
