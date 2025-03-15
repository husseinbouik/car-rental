import { VehicleService } from './../vehicle.service';
import { Component, Inject } from '@angular/core';
import { Vehicle } from '../vehicle.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vehicle-create',
    standalone: false,

  templateUrl: './vehicle-create.component.html',
  styleUrl: './vehicle-create.component.css'
})
export class VehicleCreateComponent {
  vehicle: Vehicle = {
    id: 0,
    make: '',
    model: '',
    year: 0,
    type: ''
  };
  constructor(private VehicleService: VehicleService, @Inject(Router) private router: Router) {}
  onSubmit(): void {
    this.VehicleService.createVehicle(this.vehicle).subscribe({
      next: (response) => {
        console.log('Vehicle created successfully:', response);
        this.router.navigate(['/admin/vehicles']);
      },
      error: (error) => {
        console.error('Error creating vehicle:', error);
      }
    });
  }
}
