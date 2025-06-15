import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { VehicleService } from '../vehicle.service';
import { Voiture } from '../vehicle.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-vehicle-details',
  standalone: false,
  templateUrl: './vehicle-details.component.html',
  styleUrls: ['./vehicle-details.component.css']
})
export class VehicleDetailsComponent implements OnInit {
  voiture: Voiture | undefined;
  isLoading = false;
  errorMessage: string | null = null;
  vehicleId: number | null = null;
  vehiclePhotoUrl: SafeUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.vehicleId = +idParam;
      if (!isNaN(this.vehicleId)) {
        this.loadVehicleDetails(this.vehicleId);
      } else {
        this.errorMessage = `Invalid Vehicle ID provided: ${idParam}`;
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'No Vehicle ID provided in the route.';
      this.isLoading = false;
    }
  }

  loadVehicleDetails(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.vehicleService.getVehicleById(id)
      .pipe(
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (vehicleData) => {
          this.voiture = vehicleData;
          this.loadVehiclePhoto(id);

          if (!this.voiture) {
            this.errorMessage = `Vehicle with ID ${id} not found.`;
          }
        },
        error: (error) => {
          console.error('Error fetching vehicle details:', error);
          this.errorMessage = `Failed to load vehicle details for ID ${id}. Please try again later.`;
          this.voiture = undefined;
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

  goBack(): void {
    this.router.navigate(['/admin/vehicles']);
  }

  goToEdit(): void {
    if (this.voiture?.id) {
      this.router.navigate(['/admin/vehicles/edit', this.voiture.id]);
    }
  }

  ngOnDestroy(): void {
    if (this.vehiclePhotoUrl) {
      URL.revokeObjectURL(this.vehiclePhotoUrl.toString());
    }
  }
}
