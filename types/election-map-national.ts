// types/election.ts

// Type pour les données brutes
export interface PollingStation {
  id: number;
  polling_place: string;
  office_number: number;
  voters: number;
  implantation: string;
  municipality: string;
  department: string;
  region: string;
}

// Type pour les statistiques agrégées par département
export interface DepartmentStats {
  department: string;
  region: string;
  count_polling_place: number;
  count_office_number: number;
  sum_voters: number;
  countDistinct_municipality: number;
}

// Type pour les données détaillées d'un département
export interface DepartmentDetails {
  data: PollingStation[];
}

// Type pour la réponse de l'API avec agrégation
export interface DepartmentStatsResponse {
  data: DepartmentStats[];
}
