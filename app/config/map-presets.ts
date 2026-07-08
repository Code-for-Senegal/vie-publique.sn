// app/config/map-presets.ts — Presets de navigation rapide
import type { MapRegionPreset } from '~~/types/map'

export const DEFAULT_MAP_PRESETS: MapRegionPreset[] = [
  { id: 'senegal', label: 'Sénégal', lng: -14.45, lat: 14.5, zoom: 7 },
  { id: 'dakar', label: 'Dakar', lng: -17.47, lat: 14.72, zoom: 11 },
  { id: 'casamance', label: 'Casamance', lng: -15.8, lat: 12.6, zoom: 8 },
  { id: 'touba', label: 'Touba', lng: -15.88, lat: 14.85, zoom: 12 },
  { id: 'saint-louis', label: 'Saint-Louis', lng: -16.48, lat: 16.03, zoom: 10 },
  { id: 'tambacounda', label: 'Tamba', lng: -13.67, lat: 13.77, zoom: 9 },
  { id: 'afrique-ouest', label: "Afrique de l'Ouest", lng: -5.0, lat: 12.0, zoom: 4 },
]

/** Styles de fonds de carte */
export const MAP_TILE_STYLES = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
} as const
