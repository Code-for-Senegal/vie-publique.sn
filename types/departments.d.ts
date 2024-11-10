// types/departments.d.ts

export interface DepartmentGeoData {
  id: string;
  name: string;
  region: string;
  path: string;
  //   center: [number, number];
  //   electeurs: number;
  //   bureaux: number;
  //   lieux_de_vote: number;
}

export interface MapState {
  selectedDepartment: string | null;
  hoveredDepartment: string | null;
  departments: DepartmentGeoData[];
}
