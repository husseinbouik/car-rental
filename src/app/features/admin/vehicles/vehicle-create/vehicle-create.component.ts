import { VehicleService } from './../vehicle.service';
import { Component, Inject } from '@angular/core';
import { Voiture } from '../vehicle.model'; // Update the import
import { Router } from '@angular/router';

@Component({
  selector: 'app-vehicle-create',
  standalone: false,
  templateUrl: './vehicle-create.component.html',
  styleUrl: './vehicle-create.component.css'
})
export class VehicleCreateComponent {
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

  constructor(private vehicleService: VehicleService, @Inject(Router) private router: Router) {}

  onSubmit(): void {
    this.vehicleService.createVehicle(this.voiture).subscribe({
      next: (response) => {
        console.log('Vehicle created successfully:', response);
        this.router.navigate(['/admin/vehicles']); // Update the navigation route
      },
      error: (error) => {
        console.error('Error creating vehicle:', error);
      }
    });
  }
}
