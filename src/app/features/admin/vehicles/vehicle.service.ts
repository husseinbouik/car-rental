import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Voiture } from './vehicle.model'; // Update the import to use Voiture
import { MOCK_VEHICLES } from './mock-vehicles'; // Update the import to use MOCK_VEHICLES

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  constructor() {}

  // Fetch all vehicles
  getVehicles(): Observable<Voiture[]> {
    return of(MOCK_VEHICLES); // Return the updated mock data
  }

  // Fetch a single vehicle by ID
  getVehicleById(id: number): Observable<Voiture | undefined> {
    const voiture = MOCK_VEHICLES.find(v => v.id === id);
    return of(voiture); // Return the found vehicle or undefined if not found
  }

  // Create a new vehicle
  createVehicle(voiture: Voiture): Observable<Voiture> {
    // Generate a new ID for the vehicle
    const newId = Math.max(...MOCK_VEHICLES.map(v => v.id)) + 1;
    const newVoiture = { ...voiture, id: newId };
    MOCK_VEHICLES.push(newVoiture); // Add the new vehicle to the mock data
    return of(newVoiture); // Return the newly created vehicle
  }

  // Update an existing vehicle
  updateVehicle(voiture: Voiture): Observable<Voiture> {
    const index = MOCK_VEHICLES.findIndex(v => v.id === voiture.id);
    if (index !== -1) {
      MOCK_VEHICLES[index] = voiture; // Update the vehicle in the mock data
    }
    return of(voiture); // Return the updated vehicle
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
