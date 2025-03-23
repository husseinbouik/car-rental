import { Reservation } from './reservation.model';

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 1,
    acompte: 500.0,
    date_debut: '2023-10-01T10:00:00', // ISO format for timestamp
    date_fin: '2023-10-05T10:00:00',
    montant_total: 2000.0,
    statut: 'Confirmed',
    client_id: 1,
    conducteur_secondaire_id: 2,
    voiture_id: 1
  },
  {
    id: 2,
    acompte: 300.0,
    date_debut: '2023-10-10T09:00:00',
    date_fin: '2023-10-15T09:00:00',
    montant_total: 1500.0,
    statut: 'Pending',
    client_id: 2,
    conducteur_secondaire_id: 3,
    voiture_id: 2
  },
  {
    id: 3,
    acompte: 700.0,
    date_debut: '2023-11-01T08:00:00',
    date_fin: '2023-11-07T08:00:00',
    montant_total: 3000.0,
    statut: 'Confirmed',
    client_id: 3,
    conducteur_secondaire_id: 4,
    voiture_id: 3
  }
];
