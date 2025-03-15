import { VehicleService } from './../vehicle.service';
import { Component, OnInit } from '@angular/core';
import { Vehicle } from '../vehicle.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-vehicle-details',
    standalone: false,

  templateUrl: './vehicle-details.component.html',
  styleUrl: './vehicle-details.component.css'
})
export class VehicleDetailsComponent implements OnInit {
  vehicle: Vehicle | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private VehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.VehicleService.getVehicleById(+id).subscribe({
        next: (vehicle) => {
          this.vehicle = vehicle;
        },
        error: (error) => {
          console.error('Error fetching vehicle details:', error);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/vehicles']);
  }
}
