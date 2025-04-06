export interface Reservation {
  id: number;
  acompte: number;
  dateDebut: string; // Use string for simplicity (ISO format: 'YYYY-MM-DDTHH:mm:ss')
  dateFin: string;
  montantTotal: number;
  statut: string;
  client_id: number;
  conducteur_secondaire_id: number;
  voiture_id: number;
}
