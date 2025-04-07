// src/app/features/reservations/reservation.model.ts OR Adjust path as needed

// --- Import your existing models ---
import { Client } from '../clients/client.model';     // Adjust path to your Client model file
import { Voiture } from '../vehicles/vehicle.model'; // Adjust path to your Voiture model file
// --- End imports ---


export interface Reservation {
  id: number | null; // Can be null for new reservations before saving
  acompte: number;
  dateDebut: string; // ISO format string (e.g., 'YYYY-MM-DDTHH:mm:ss')
  dateFin: string;   // ISO format string
  montantTotal: number;
  statut: string;

  // --- IDs used primarily for form binding and sending data ---
  // Use undefined for initial state in forms where selection is required
  client_id: number | undefined;
  voiture_id: number | undefined;
  // Allow null for optional secondary driver
  conducteur_secondaire_id: number | null;

  // --- Optional nested objects reflecting API response for GET /reservations/{id} ---
  // Use your existing imported models here
  client?: Client | null;
  voiture?: Voiture | null;
  // The secondary driver is also a Client
  conducteurSecondaire?: Client | null;
}
