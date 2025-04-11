// types/participation.ts
export interface DepartmentData {
  region: string;
  departement: string;
  voters: number;
  participation_10h?: number;
  participation_12h?: number;
  participation_14h?: number;
  participation_17h?: number;
}

export interface ParticipationState {
  lastUpdate: string;
  departments: DepartmentData[];
}
