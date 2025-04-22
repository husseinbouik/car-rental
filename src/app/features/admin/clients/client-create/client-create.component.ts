// src/app/features/clients/client-create/client-create.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ClientService } from '../client.service';
import { Client } from '../client.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-client-create',
  standalone: false,
  templateUrl: './client-create.component.html',
  styleUrls: ['./client-create.component.css'],
})
export class ClientCreateComponent implements OnInit {
  client: Client = {
    id: 0,
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
    tel: '',
  };

  isEditMode = false;
  isLoading = false;
  errorMessage: string | null = null;
  pageTitle = 'Create New Client';
  submitButtonText = 'Create Client';
  clientId: number | null = null;

  // Separate previews for each image type
  photoCINPreview: string | null = null;
  photoPermisPreview: string | null = null;

  // Files for upload
  photoCINFile: File | null = null;
  photoPermisFile: File | null = null;

  // URLs for existing images
  photoCINUrl: string | null = null;
  photoPermisUrl: string | null = null;

  constructor(
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.clientId = +idParam;
      if (!isNaN(this.clientId)) {
        this.isEditMode = true;
        this.pageTitle = 'Edit Client';
        this.submitButtonText = 'Save Changes';
        this.loadClientData(this.clientId);
      } else {
        this.errorMessage = `Invalid Client ID provided in URL: ${idParam}`;
        this.isLoading = false;
      }
    } else {
      this.isEditMode = false;
      this.pageTitle = 'Create New Client';
      this.submitButtonText = 'Create Client';
      this.isLoading = false;
    }
  }

  loadClientData(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.clientService.getClientById(id)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.client = {
              ...data,
              cinDelivreLe: this.formatDateForInput(data.cinDelivreLe),
              permisDelivreLe: this.formatDateForInput(data.permisDelivreLe),
            };

            // Set existing image URLs
            if (data.photoCIN) {
              this.photoCINUrl = 'data:image/jpeg;base64,' + data.photoCIN;
            }
            if (data.photoPermis) {
              this.photoPermisUrl = 'data:image/jpeg;base64,' + data.photoPermis;
            }
          } else {
            this.errorMessage = `Client with ID ${id} not found.`;
          }
        },
        error: (err) => {
          console.error('Error fetching client:', err);
          this.errorMessage = `Failed to load client data (ID: ${id}). Please try again.`;
        },
      });
  }

  formatDateForInput(dateString: string | null | undefined): string {
    if (!dateString) return '';
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      console.warn('Could not format date string for input:', dateString, e);
    }
    return dateString;
  }

  onFileSelected(event: Event, fileType: 'photoCIN' | 'photoPermis'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.clearFilePreview(fileType);
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      if (fileType === 'photoCIN') {
        this.photoCINFile = file;
        this.photoCINPreview = reader.result as string;
      } else {
        this.photoPermisFile = file;
        this.photoPermisPreview = reader.result as string;
      }
    };

    reader.onerror = () => {
      console.error('Error reading file');
      this.clearFilePreview(fileType);
    };

    reader.readAsDataURL(file);
  }

  clearFilePreview(fileType: 'photoCIN' | 'photoPermis'): void {
    if (fileType === 'photoCIN') {
      this.photoCINFile = null;
      this.photoCINPreview = null;
    } else {
      this.photoPermisFile = null;
      this.photoPermisPreview = null;
    }
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const formData = new FormData();
    formData.append('cname', this.client.cname);
    formData.append('adresse', this.client.adresse);
    formData.append('nationalite', this.client.nationalite);
    formData.append('adresseEtranger', this.client.adresseEtranger ?? '');
    formData.append('passeport', this.client.passeport ?? '');
    formData.append('delivreLePasseport', this.client.delivreLePasseport ?? '');
    formData.append('cin', this.client.cin);
    formData.append('cinDelivreLe', this.client.cinDelivreLe ?? '');
    formData.append('tel', this.client.tel);
    formData.append('permis', this.client.permis);
    formData.append('permisDelivreLe', this.client.permisDelivreLe ?? '');
    formData.append('permisDelivreAu', this.client.permisDelivreAu ?? '');

    if (this.photoCINFile) {
      formData.append('photoCIN', this.photoCINFile, this.photoCINFile.name);
    }
    if (this.photoPermisFile) {
      formData.append('photoPermis', this.photoPermisFile, this.photoPermisFile.name);
    }

    const operation = this.isEditMode
      ? this.clientService.updateClient(this.client.id!, formData)
      : this.clientService.createClient(formData);

    operation.pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.router.navigate(['/admin/clients'], {
            state: { successMessage: `Client ${this.isEditMode ? 'updated' : 'created'} successfully!` },
          });
        },
        error: (err: HttpErrorResponse) => {
          this.handleError(err);
        },
      });
  }

  private handleError(err: HttpErrorResponse): void {
    console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} client:`, err);
    if (err.error && typeof err.error === 'string' && err.status !== 500) {
      this.errorMessage = err.error;
    } else if (err.error?.message) {
      this.errorMessage = err.error.message;
    } else {
      this.errorMessage = `Failed to ${this.isEditMode ? 'update' : 'create'} client. Status: ${err.status}`;
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/clients']);
  }
}
