// types/statistics.ts
export interface GenderData {
  sexe: "HOMME" | "FEMME";
  nombre: number;
}

export interface AgeGroupData {
  tranche: string;
  nombre: number;
  pourcentage: number;
}
