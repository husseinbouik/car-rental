import { Voiture } from './vehicle.model'; // Update the import to use Voiture

export const MOCK_VEHICLES: Voiture[] = [
  {
    id: 1,
    marque: 'Toyota',
    modele: 'Camry',
    matricule: 'ABC-123',
    type: 'Sedan',
    prixDeBase: 450,
    capacite: 5,
    carburant: 'Essence',
    couleur: 'Blanc',
    estAutomate: true,
    vname: 'Camry 2023'
  },
  {
    id: 2,
    marque: 'Honda',
    modele: 'CR-V',
    matricule: 'XYZ-456',
    type: 'SUV',
    prixDeBase: 550,
    capacite: 5,
    carburant: 'Essence',
    couleur: 'Noir',
    estAutomate: false,
    vname: 'CR-V 2024'
  },
  {
    id: 3,
    marque: 'Ford',
    modele: 'F-150',
    matricule: 'DEF-789',
    type: 'Truck',
    prixDeBase: 750,
    capacite: 3,
    carburant: 'Diesel',
    couleur: 'Rouge',
    estAutomate: true,
    vname: 'F-150 2022'
  }
];
