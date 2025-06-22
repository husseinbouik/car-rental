// src/app/features/profil/profil-info/profil-info.component.ts
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { ClientService } from '../../admin/clients/client.service';
import { AuthService } from '../auth.service';
import { catchError, of, Subscription } from 'rxjs';

// Dummy Client model for frontend structure
export interface ClientProfile {
  id?: number | null;
  userId?: number | null;
  cname?: string | null;
  tel?: string | null;
  email?: string | null;
  adresse?: string | null;
  nationalite?: string | null;
  adresseEtranger?: string | null;
  cin?: string | null;
  cinDelivreLe?: string | null; // Expect YYYY-MM-DD string
  passeport?: string | null;
  delivreLePasseport?: string | null;
  permis?: string | null;
  permisDelivreLe?: string | null; // Expect YYYY-MM-DD string
  permisDelivreAu?: string | null;
  photoCINUrl?: string | null; // URL of existing photo
  photoPermisUrl?: string | null; // URL of existing photo
}

@Component({
  selector: 'app-profil-info',
  standalone: false, // Set to true if you want to use this as a standalone component
  templateUrl: './profil-info.component.html',
  styleUrls: ['./profil-info.component.css']
  // If you generated as standalone, uncomment these:
  // standalone: true,
  // imports: [CommonModule, FormsModule] // Add FormsModule and CommonModule
})
export class ProfilInfoComponent implements OnInit, OnDestroy {
  pageTitle: string = 'My Profile Information';
  client: ClientProfile = {
    // Initialize with empty data
  };
  isLoading: boolean = true;
  isSaving: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  photoCINPreview: string | ArrayBuffer | null = null;
  photoPermisPreview: string | ArrayBuffer | null = null;
  photoCINFile: File | null = null;
  photoPermisFile: File | null = null;

  private photoSubscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private clientService: ClientService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Check if user is logged in
      if (!this.authService.isLoggedIn()) {
        this.errorMessage = 'Please log in to view your profile.';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
        return;
      }

      this.loadClientProfile();
    }
  }

  ngOnDestroy(): void {
    this.photoSubscriptions.forEach(subscription => subscription.unsubscribe());
    if (isPlatformBrowser(this.platformId)) {
      // Clean up blob URLs if they exist
      if (this.client.photoCINUrl && this.client.photoCINUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.client.photoCINUrl);
      }
      if (this.client.photoPermisUrl && this.client.photoPermisUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.client.photoPermisUrl);
      }
    }
  }

  loadClientProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const clientId = this.authService.getCurrentClientId();
    if (!clientId) {
      this.errorMessage = 'Client ID not found. Please log in again.';
      this.isLoading = false;
      return;
    }

    this.clientService.getClientById(clientId)
      .pipe(
        catchError(error => {
          console.error('Error loading client profile:', error);
          this.errorMessage = 'Failed to load profile information. Please try again.';
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe(client => {
        if (client) {
          this.client = {
            id: client.id,
            userId: client.userId,
            cname: client.cname,
            tel: client.tel,
            email: '', // Email is not in the Client model, will be handled separately if needed
            adresse: client.adresse,
            nationalite: client.nationalite,
            adresseEtranger: client.adresseEtranger,
            cin: client.cin,
            cinDelivreLe: client.cinDelivreLe,
            passeport: client.passeport,
            delivreLePasseport: client.delivreLePasseport,
            permis: client.permis,
            permisDelivreLe: client.permisDelivreLe,
            permisDelivreAu: client.permisDelivreAu,
            photoCINUrl: undefined,
            photoPermisUrl: undefined
          };

          // Load photos
          this.loadClientPhotos(clientId);
        }
        this.isLoading = false;
      });
  }

  loadClientPhotos(clientId: number): void {
    // Load CIN photo
    const cinSubscription = this.clientService.getCinPhoto(clientId)
      .pipe(
        catchError(error => {
          console.error('Error loading CIN photo:', error);
          return of(null);
        })
      )
      .subscribe(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          this.client.photoCINUrl = url;
        }
      });

    // Load Permis photo
    const permisSubscription = this.clientService.getPermisPhoto(clientId)
      .pipe(
        catchError(error => {
          console.error('Error loading Permis photo:', error);
          return of(null);
        })
      )
      .subscribe(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          this.client.photoPermisUrl = url;
        }
      });

    this.photoSubscriptions.push(cinSubscription, permisSubscription);
  }

  onFileSelected(event: Event, fileType: 'photoCIN' | 'photoPermis'): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;

    if (fileList && fileList[0]) {
      const file = fileList[0];
      const reader = new FileReader();
      reader.onload = e => {
        if (fileType === 'photoCIN') {
          this.photoCINPreview = reader.result;
        } else if (fileType === 'photoPermis') {
          this.photoPermisPreview = reader.result;
        }
      };
      reader.readAsDataURL(file);
      // In a real app:
      if (fileType === 'photoCIN') this.photoCINFile = file;
      else if (fileType === 'photoPermis') this.photoPermisFile = file;
    } else {
      if (fileType === 'photoCIN') {
        this.photoCINPreview = null;
        this.photoCINFile = null;
      } else if (fileType === 'photoPermis') {
        this.photoPermisPreview = null;
        this.photoPermisFile = null;
      }
    }
  }

  onSubmit(form: NgForm): void { // Receive form reference
    this.errorMessage = null;
    this.successMessage = null;

    if (form.invalid) {
      this.errorMessage = 'Please correct the errors in the form.';
      // Mark all fields as touched to show validation errors
      Object.keys(form.controls).forEach(field => {
        const control = form.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }

    if (!this.client.id) {
      this.errorMessage = 'Client ID not found. Please try again.';
      return;
    }

    this.isSaving = true;
    console.log('Form Submitted. Client Data:', this.client);
    console.log('CIN File to upload:', this.photoCINFile);
    console.log('Permis File to upload:', this.photoPermisFile);

    // Create FormData for the update
    const formData = new FormData();

    // Add all client data to FormData
    formData.append('cname', this.client.cname || '');
    formData.append('tel', this.client.tel || '');
    formData.append('adresse', this.client.adresse || '');
    formData.append('nationalite', this.client.nationalite || '');
    formData.append('adresseEtranger', this.client.adresseEtranger || '');
    formData.append('cin', this.client.cin || '');
    formData.append('cinDelivreLe', this.client.cinDelivreLe || '');
    formData.append('passeport', this.client.passeport || '');
    formData.append('delivreLePasseport', this.client.delivreLePasseport || '');
    formData.append('permis', this.client.permis || '');
    formData.append('permisDelivreLe', this.client.permisDelivreLe || '');
    formData.append('permisDelivreAu', this.client.permisDelivreAu || '');

    // Add photos if new ones were selected
    if (this.photoCINFile) {
      formData.append('photoCIN', this.photoCINFile);
    }
    if (this.photoPermisFile) {
      formData.append('photoPermis', this.photoPermisFile);
    }

    this.clientService.updateClient(this.client.id, formData)
      .pipe(
        catchError(error => {
          console.error('Error updating client profile:', error);
          this.errorMessage = 'Failed to update profile. Please try again.';
          this.isSaving = false;
          return of(null);
        })
      )
      .subscribe(updatedClient => {
        if (updatedClient) {
          this.successMessage = 'Profile updated successfully!';

          // Clear file previews and files
          this.photoCINPreview = null;
          this.photoPermisPreview = null;
          this.photoCINFile = null;
          this.photoPermisFile = null;

          // Reload the profile to get updated photos
          setTimeout(() => {
            this.loadClientProfile();
          }, 1000);
        }
        this.isSaving = false;

        // Clear messages after 5 seconds
        setTimeout(() => {
          this.successMessage = null;
          this.errorMessage = null;
        }, 5000);
      });
  }

  cancel(): void {
    console.log('Cancel button clicked. Navigating to home (simulation).');
    // In a real app, you might reload original data or navigate
    this.router.navigate(['/']); // Example navigation
  }

  refreshProfile(): void {
    this.loadClientProfile();
  }
}
