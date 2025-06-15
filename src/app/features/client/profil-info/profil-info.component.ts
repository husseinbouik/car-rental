// src/app/features/profil/profil-info/profil-info.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms'; // Import NgForm for form reference

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
export class ProfilInfoComponent implements OnInit {
  pageTitle: string = 'My Profile Information';
  client: ClientProfile = {
    // Initialize with some dummy data or empty
    id: 1, // Simulate an existing client
    userId: 101, // Simulate a logged-in user ID
    cname: 'John Doe',
    tel: '+1 (555) 123-4567',
    email: 'john.doe@example.com',
    adresse: '123 Main St, Anytown, USA',
    nationalite: 'American',
    cin: 'AB123456',
    cinDelivreLe: '2020-01-15',
    permis: 'D7891011',
    permisDelivreLe: '2019-06-20',
    permisDelivreAu: 'DMV Anytown',
    // Simulate existing photos by providing placeholder URLs
    photoCINUrl: 'https://via.placeholder.com/150/0000FF/808080?Text=Current+CIN',
    photoPermisUrl: 'https://via.placeholder.com/150/00FF00/808080?Text=Current+Permis'
  };
  isLoading: boolean = false; // Simulate initial loading finished
  isSaving: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  photoCINPreview: string | ArrayBuffer | null = null;
  photoPermisPreview: string | ArrayBuffer | null = null;
  // These would hold the File objects if you were actually uploading
  // photoCINFile: File | null = null;
  // photoPermisFile: File | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // In a real app, you'd load client data here based on logged-in user
    console.log('ProfilInfoComponent initialized with mock client data.');
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
      // if (fileType === 'photoCIN') this.photoCINFile = file;
      // else if (fileType === 'photoPermis') this.photoPermisFile = file;
    } else {
      if (fileType === 'photoCIN') {
        this.photoCINPreview = null;
        // this.photoCINFile = null;
      } else if (fileType === 'photoPermis') {
        this.photoPermisPreview = null;
        // this.photoPermisFile = null;
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

    this.isSaving = true;
    console.log('Form Submitted. Client Data:', this.client);
    // console.log('CIN File to upload:', this.photoCINFile);
    // console.log('Permis File to upload:', this.photoPermisFile);

    // Simulate API call
    setTimeout(() => {
      this.isSaving = false;
      // Simulate success
      this.successMessage = 'Profile information hypothetically saved!';
      // Clear previews if you want to simulate the "saved" state resetting them
      // this.photoCINPreview = null;
      // this.photoPermisPreview = null;

      // Simulate error (uncomment to test error display)
      // this.errorMessage = 'Simulated error: Could not save profile.';

      setTimeout(() => { // Clear message after a few seconds
          this.successMessage = null;
          this.errorMessage = null;
      }, 5000);
    }, 2000);
  }

  cancel(): void {
    console.log('Cancel button clicked. Navigating to home (simulation).');
    // In a real app, you might reload original data or navigate
    this.router.navigate(['/']); // Example navigation
  }
}
