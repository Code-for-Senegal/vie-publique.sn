// types/geo.ts
export interface RegionProperties {
  name: string;
  population?: number;
  // Autres propriétés selon votre GeoJSON
}

export interface MapConfig {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  colors: {
    default: string;
    hover: string;
    stroke: string;
    strokeWidth: number;
  };
}
