import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ClientService } from '../client.service';
import { Client } from '../client.model';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-client-create',
  standalone: false,
  templateUrl: './client-create.component.html',
  styleUrls: ['./client-create.component.css'],
})
export class ClientCreateComponent implements OnInit {
  client: Client = {
    id: 0,
    userId:null,
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

  // URLs for existing images (now using SafeUrl)
  photoCINUrl: SafeUrl | null = null;
  photoPermisUrl: SafeUrl | null = null;

  constructor(
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
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

    // First load the client data
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

            // Load photos separately
            this.loadCinPhoto(id);
            this.loadPermisPhoto(id);
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
        // Clear the existing URL if a new file is selected
        if (this.photoCINUrl) {
          URL.revokeObjectURL(this.photoCINUrl.toString());
          this.photoCINUrl = null;
        }
      } else {
        this.photoPermisFile = file;
        this.photoPermisPreview = reader.result as string;
        // Clear the existing URL if a new file is selected
        if (this.photoPermisUrl) {
          URL.revokeObjectURL(this.photoPermisUrl.toString());
          this.photoPermisUrl = null;
        }
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
    } else if (this.isEditMode && !this.photoCINPreview && !this.photoCINUrl) {
      // If in edit mode and no file is selected and no existing photo, send null to delete
      formData.append('photoCIN', 'null');
    }

    if (this.photoPermisFile) {
      formData.append('photoPermis', this.photoPermisFile, this.photoPermisFile.name);
    } else if (this.isEditMode && !this.photoPermisPreview && !this.photoPermisUrl) {
      // If in edit mode and no file is selected and no existing photo, send null to delete
      formData.append('photoPermis', 'null');
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

  ngOnDestroy(): void {
    // Clean up object URLs when component is destroyed
    if (this.photoCINUrl) {
      URL.revokeObjectURL(this.photoCINUrl.toString());
    }
    if (this.photoPermisUrl) {
      URL.revokeObjectURL(this.photoPermisUrl.toString());
    }
  }
}
