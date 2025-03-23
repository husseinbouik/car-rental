export interface Reservation {
  id: number;
  acompte: number;
  date_debut: string; // Use string for simplicity (ISO format: 'YYYY-MM-DDTHH:mm:ss')
  date_fin: string;
  montant_total: number;
  statut: string;
  client_id: number;
  conducteur_secondaire_id: number;
  voiture_id: number;
}
