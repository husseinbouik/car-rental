export interface Reservation {
  id: number;
  vehicleId: number;
  clientId: number;
  startDate: Date;
  endDate: Date;
  status: string; // e.g., "Pending", "Confirmed", "Cancelled"
}
