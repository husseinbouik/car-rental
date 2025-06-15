import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { VehicleService } from '../vehicle.service';
import { Voiture } from '../vehicle.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-vehicle-create',
  standalone: false,
  templateUrl: './vehicle-create.component.html',
  styleUrls: ['./vehicle-create.component.css']
})
export class VehicleCreateComponent implements OnInit {
  voiture: Voiture = {
    id: 0,
    marque: '',
    modele: '',
    matricule: '',
    type: '',
    prixDeBase: 0,
    capacite: 0,
    carburant: '',
    couleur: '',
    estAutomate: false,
    vname: ''
  };

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isEditMode = false;
  isLoading = false;
  errorMessage: string | null = null;
  pageTitle = 'Create New Vehicle';
  submitButtonText = 'Create Vehicle';
  vehicleId: number | null = null;
  vehiclePhotoUrl: SafeUrl | null = null;

  constructor(
    private vehicleService: VehicleService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.vehicleId = +idParam;
      if (!isNaN(this.vehicleId)) {
        this.isEditMode = true;
        this.pageTitle = 'Edit Vehicle';
        this.submitButtonText = 'Save Changes';
        this.loadVehicleData(this.vehicleId);
      } else {
        this.errorMessage = `Invalid Vehicle ID provided in URL: ${idParam}`;
        this.isLoading = false;
      }
    } else {
      this.isEditMode = false;
      this.pageTitle = 'Create New Vehicle';
      this.submitButtonText = 'Create Vehicle';
      this.voiture.prixDeBase = null as any;
      this.voiture.capacite = null as any;
      this.isLoading = false;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);

      // Clear the existing URL if a new file is selected
      if (this.vehiclePhotoUrl) {
        URL.revokeObjectURL(this.vehiclePhotoUrl.toString());
        this.vehiclePhotoUrl = null;
      }
    }
  }

  loadVehicleData(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.vehicleService.getVehicleById(id)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (data) => {
          if (data) {
            this.voiture = data;
            this.loadVehiclePhoto(id);
          } else {
            this.errorMessage = `Vehicle with ID ${id} not found.`;
          }
        },
        error: (err) => {
          console.error('Error fetching vehicle:', err);
          this.errorMessage = `Failed to load vehicle data (ID: ${id}). Please try again.`;
        }
      });
  }

  loadVehiclePhoto(id: number): void {
    this.vehicleService.getVehiclePhoto(id).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.vehiclePhotoUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      },
      error: (error) => {
        console.error('Error loading vehicle photo:', error);
        this.vehiclePhotoUrl = null;
      }
    });
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const formData = new FormData();
    formData.append('vname', this.voiture.vname || '');
    formData.append('couleur', this.voiture.couleur || '');
    formData.append('marque', this.voiture.marque || '');
    formData.append('matricule', this.voiture.matricule || '');
    formData.append('modele', this.voiture.modele || '');
    formData.append('carburant', this.voiture.carburant || '');
    formData.append('capacite', this.voiture.capacite?.toString() || '0');
    formData.append('type', this.voiture.type || '');
    formData.append('prixDeBase', this.voiture.prixDeBase?.toString() || '0');
    formData.append('estAutomate', this.voiture.estAutomate?.toString() || 'false');

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    } else if (this.isEditMode && !this.imagePreview && !this.vehiclePhotoUrl) {
      formData.append('photo', 'null'); // To delete existing photo
    }

    const operation = this.isEditMode
      ? this.vehicleService.updateVehicle(this.voiture.id!, formData)
      : this.vehicleService.createVehicle(formData);

    operation
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          this.router.navigate(['/admin/vehicles'], {
            state: { successMessage: `Vehicle ${this.isEditMode ? 'updated' : 'created'} successfully!` }
          });
        },
        error: (err: HttpErrorResponse) => {
          this.handleError(err);
        }
      });
  }

  private handleError(err: HttpErrorResponse): void {
    console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} vehicle:`, err);
    if (err.error && typeof err.error === 'string' && err.status !== 500) {
      this.errorMessage = err.error;
    } else if (err.error && err.error.message) {
      this.errorMessage = err.error.message;
    } else {
      this.errorMessage = `Failed to ${this.isEditMode ? 'update' : 'create'} vehicle. Status: ${err.status} - ${err.statusText || 'Unknown error'}.`;
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/vehicles']);
  }

  ngOnDestroy(): void {
    if (this.vehiclePhotoUrl) {
      URL.revokeObjectURL(this.vehiclePhotoUrl.toString());
    }
  }
}
