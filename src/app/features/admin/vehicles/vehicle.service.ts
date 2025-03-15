import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Vehicle } from './vehicle.model';
import { MOCK_VEHICLES } from './mock-vehicles';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  constructor() {}

  // Fetch all vehicles
  getVehicles(): Observable<Vehicle[]> {
    return of(MOCK_VEHICLES);
  }

  // Fetch a single vehicle by ID
  getVehicleById(id: number): Observable<Vehicle | undefined> {
    const vehicle = MOCK_VEHICLES.find(v => v.id === id);
    return of(vehicle); // Return the found vehicle or undefined if not found
  }

  // Create a new vehicle
  createVehicle(vehicle: Vehicle): Observable<Vehicle> {
    // Generate a new ID for the vehicle
    const newId = Math.max(...MOCK_VEHICLES.map(v => v.id)) + 1;
    const newVehicle = { ...vehicle, id: newId };
    MOCK_VEHICLES.push(newVehicle); // Add the new vehicle to the mock data
    return of(newVehicle); // Return the newly created vehicle
  }

  // Update an existing vehicle
  updateVehicle(vehicle: Vehicle): Observable<Vehicle> {
    const index = MOCK_VEHICLES.findIndex(v => v.id === vehicle.id);
    if (index !== -1) {
      MOCK_VEHICLES[index] = vehicle; // Update the vehicle in the mock data
    }
    return of(vehicle); // Return the updated vehicle
  }

  // Delete a vehicle by ID
  deleteVehicle(id: number): Observable<void> {
    const index = MOCK_VEHICLES.findIndex(v => v.id === id);
    if (index !== -1) {
      MOCK_VEHICLES.splice(index, 1); // Remove the vehicle from the mock data
    }
    return of(undefined); // Return nothing (or success status if needed)
  }
}
