import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Vehicle } from './vehicle.model';
import { MOCK_VEHICLES } from './mock-vehicles';


@Injectable({
  providedIn: 'root'
})
export class VehicleService {

    constructor() {}

  getVehicles(): Observable<Vehicle[]> {
        return of(MOCK_VEHICLES);
    }
    // the other method will be added when we integrate it withe the backend
    createVehicle(vehicle: Vehicle): Observable<Vehicle> {
        // Replace with API call
        return of(vehicle);  // Return the same vehicle (for now)
      }

      updateVehicle(vehicle: Vehicle): Observable<Vehicle> {
         // Replace with API call
        return of(vehicle); // Return the updated vehicle
      }

      deleteVehicle(id: number): Observable<void> {
         // Replace with API call
        return of(undefined); // Return nothing (or success status if needed)
      }

}
