export interface Client {
  id: number;
  userId: number | null;
  cinDelivreLe: string | null;
  permisDelivreAu: string | null;
  permisDelivreLe: string | null;
  adresse: string;
  adresseEtranger: string | null;
  cin: string;
  cname: string;
  delivreLePasseport: string | null;
  nationalite: string;
  passeport: string | null;
  permis: string;
  tel: string;
  photoCIN?: any;
  photoPermis?: any;
}
