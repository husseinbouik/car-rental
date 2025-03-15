import { Reservation } from './reservation.model';

export const MOCK_RESERVATIONS: Reservation[] = [
  { id: 1, vehicleId: 1, clientId: 1, startDate: new Date('2023-10-01'), endDate: new Date('2023-10-05'), status: 'Confirmed' },
  { id: 2, vehicleId: 2, clientId: 2, startDate: new Date('2023-10-10'), endDate: new Date('2023-10-15'), status: 'Pending' },
];
