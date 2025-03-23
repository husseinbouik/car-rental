import { VehicleService } from './../vehicle.service';
import { Component, OnInit } from '@angular/core';
import { Voiture } from '../vehicle.model'; // Update the import
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-vehicle-details',
  standalone: false,
  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.css'
})
export class VehicleDetailsComponent implements OnInit {
  voiture: Voiture | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.vehicleService.getVehicleById(+id).subscribe({
        next: (voiture) => {
          this.voiture = voiture;
        },
        error: (error) => {
          console.error('Error fetching vehicle details:', error);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/vehicles']); 
  }
}
