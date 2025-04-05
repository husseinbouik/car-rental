import { VehicleService } from './../vehicle.service';
import { Component, Inject, OnInit } from '@angular/core';
import { Voiture } from '../vehicle.model'; // Update the import
import { Router, ActivatedRoute } from '@angular/router';

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
  isEditMode: boolean = false;

  constructor(
    private vehicleService: VehicleService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const vehicleId = this.route.snapshot.paramMap.get('id');
    if (vehicleId) {
      this.isEditMode = true;
      this.loadVehicle(Number(vehicleId));
    }
  }

  loadVehicle(id: number): void {
    this.vehicleService.getVehicleById(id).subscribe({
      next: (vehicle) => {
        this.voiture = vehicle;
      },
      error: (error) => {
        console.error('Error loading vehicle:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.isEditMode) {
      this.updateVehicle();
    } else {
      this.createVehicle();
    }
  }

  createVehicle(): void {
    this.vehicleService.createVehicle(this.voiture).subscribe({
      next: (response) => {
        console.log('Vehicle created successfully:', response);
        this.router.navigate(['/admin/vehicles']);
      },
      error: (error) => {
        console.error('Error creating vehicle:', error);
      }
    });
  }

  updateVehicle(): void {
    this.vehicleService.updateVehicle(this.voiture).subscribe({
      next: (response) => {
        console.log('Vehicle updated successfully:', response);
        this.router.navigate(['/admin/vehicles']);
      },
      error: (error) => {
        console.error('Error updating vehicle:', error);
      }
    });
  }
}
