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
