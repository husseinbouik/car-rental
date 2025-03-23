import { Client } from './client.model';

export const MOCK_CLIENTS: Client[] = [
  {
    id: 1,
    cin_delivre_le: '2020-01-01',
    permis_delivre_au: 'City A',
    permis_delivre_le: '2020-02-01',
    adresse: '123 Main St',
    adresse_etranger: '456 Foreign St',
    cin: 'A123456',
    cname: 'Alice Johnson',
    delivre_le_passeport: '2020-03-01',
    nationalite: 'American',
    passeport: 'P123456',
    permis: 'D123456',
    tel: '123-456-7890'
  },
  {
    id: 2,
    cin_delivre_le: '2021-01-01',
    permis_delivre_au: 'City B',
    permis_delivre_le: '2021-02-01',
    adresse: '456 Elm St',
    adresse_etranger: '789 Foreign St',
    cin: 'B654321',
    cname: 'Bob Smith',
    delivre_le_passeport: '2021-03-01',
    nationalite: 'Canadian',
    passeport: 'P654321',
    permis: 'D654321',
    tel: '987-654-3210'
  }
];
