export interface Voiture {
  id: number;
  capacite?: number;
  carburant?: string;
  couleur?: string;
  estAutomate?: boolean;
  marque?: string;
  matricule?: string;
  modele?: string;
  prixDeBase: number;
  type?: string;
  vname?: string;
  photo?: any; // This can be more specific if you know the type
}
