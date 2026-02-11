// types/election-map.ts

export interface GeoPosition {
  type: "Polygon";
  coordinates: number[][][];
}

export interface Department {
  id: number;
  region: string;
  departement: string;
  Position: GeoPosition;
}

export interface TransformedRegion {
  id: number;
  region: string;
  departement: string;
  winnerName?: string;
  winnerColor?: string;
  winnerLogo?: string;
  headOfList?: string;
  voters?: number;
  coordinates: [number, number][];
  type: "Polygon";
}

export interface DirectusResponse<T> {
  data: T[];
}

export type LatLng = [number, number];

export interface MapError {
  code: string;
  message: string;
  details?: unknown;
}

/** Commune dans un groupe de département (élections locales) */
export interface MunicipalityPolygon {
  id: number;
  municipality: string;
  departement: string;
  region: string;
  voters: number;
  offices: number;
  places: number;
  population: number;
  coordinates: [number, number][];
}

/** Groupe de communes regroupées par département (élections locales) */
export interface DepartmentGroup {
  departement: string;
  region: string;
  municipalities: MunicipalityPolygon[];
  totalVoters: number;
  totalOffices: number;
  totalPlaces: number;
  totalPopulation: number;
  municipalityCount: number;
  centroid: [number, number];
  color: string;
}

/** Commune du top 3 par électeurs */
export interface TopCommune {
  municipality: string;
  voters: number;
}
