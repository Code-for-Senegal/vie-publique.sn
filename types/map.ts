// types/map.ts — TYPES GÉNÉRIQUES DU SYSTÈME DE CARTE SÉNÉGAL
// Système configuration-driven : on change la config, on change ce que la carte affiche.

import type { Component } from 'vue';
import type { Feature, FeatureCollection, Geometry } from 'geojson';

// ─── Types de couches supportées ──────────────────────────────────

export type LayerType =
  | 'choropleth' // Régions/départements colorés (GeoJsonLayer)
  | 'scatterplot' // Cercles proportionnels (ScatterplotLayer)
  | 'heatmap' // Carte de chaleur (HeatmapLayer)
  | 'icon' // Icônes catégorisées (IconLayer)
  | 'arc' // Arcs entre deux points (ArcLayer)
  | 'path' // Lignes/routes (PathLayer)
  | 'text' // Labels textuels (TextLayer)
  | 'cluster' // Points clusterisés via Supercluster
  | 'geojson'; // GeoJSON brut (polygones, lignes, points)

// ─── Gradient de couleurs ─────────────────────────────────────────

export type RGBAColor = [number, number, number, number];

export interface ColorStop {
  /** Seuil numérique (ex. 0, 25, 50, 75, 100) */
  value: number;
  /** Couleur RGBA */
  color: RGBAColor;
  /** Label dans la légende (ex. "Faible", "Élevé") */
  label?: string;
}

export interface ColorScale {
  type: 'gradient' | 'category' | 'threshold';
  stops: ColorStop[];
  /** Couleur si donnée absente */
  fallback: RGBAColor;
}

// ─── Configuration d'un dataset / couche ──────────────────────────

export interface MapDatasetConfig<T = any> {
  /** Identifiant unique de la couche */
  id: string;
  /** Label affiché dans les contrôles */
  label: string;
  /** Icône (emoji ou nom d'icône) pour les contrôles */
  icon?: string;
  /** Type de couche deck.gl */
  type: LayerType;
  /** Visible par défaut */
  visible?: boolean;
  /** Zoom min de visibilité */
  minZoom?: number;
  /** Zoom max de visibilité */
  maxZoom?: number;
  /** Opacité (0-255) */
  opacity?: number;

  // ─── Source de données ────────────
  /** Données brutes (réactif, injecté via ref/computed) */
  data: T[];
  /** URL à fetcher (GeoJSON, JSON) */
  dataUrl?: string;
  /** Intervalle de refresh auto en ms (0 = pas de refresh) */
  refreshInterval?: number;

  // ─── Mapping des champs (data → rendu) ────────────
  /** Fonction qui extrait [lng, lat] d'un item */
  getPosition?: (d: T) => [number, number];
  /** Champ pour le join GeoJSON (ex. 'code' pour choroplèthe) */
  joinField?: string;
  /** Champ dans le GeoJSON pour le join */
  geoJoinField?: string;
  /** Fonction qui extrait la valeur numérique pour colorier */
  getValue?: (d: T) => number;
  /** Fonction qui extrait le label textuel */
  getLabel?: (d: T) => string;
  /** Fonction qui extrait le rayon (pour scatterplot) */
  getRadius?: (d: T) => number;
  /** Fonction pour la couleur catégorielle (overrides colorScale) */
  getColor?: (d: T) => RGBAColor;

  // ─── Rendu ────────────
  colorScale?: ColorScale;
  /** Rayon min en pixels (scatterplot) */
  radiusMinPixels?: number;
  /** Rayon max en pixels (scatterplot) */
  radiusMaxPixels?: number;
  /** Rayon de base en mètres (scatterplot) */
  radiusScale?: number;
  /** Largeur de ligne (path, geojson contours) */
  lineWidth?: number;
  /** Rendre la couche cliquable */
  pickable?: boolean;

  // ─── Arc (flux) ────────────
  getSourcePosition?: (d: T) => [number, number];
  getTargetPosition?: (d: T) => [number, number];
  getSourceColor?: (d: T) => RGBAColor;
  getTargetColor?: (d: T) => RGBAColor;
  /** Largeur de l'arc (nombre fixe ou fonction) */
  getWidth?: number | ((d: T) => number);

  // ─── Cluster ────────────
  clusterRadius?: number;
  clusterMaxZoom?: number;

  // ─── Popup ────────────
  popup?: PopupConfig<T>;
}

// ─── Configuration des popups ─────────────────────────────────────

export interface PopupFieldConfig<T = any> {
  /** Clé du champ dans l'objet data */
  key: string;
  /** Label affiché */
  label: string;
  /** Type de formatage */
  format?: 'number' | 'percent' | 'currency' | 'date' | 'text' | 'bar' | 'badge';
  /** Couleur CSS (pour les badges/barres) */
  color?: string | ((d: T) => string);
  /** Suffixe (ex. '%', ' FCFA', ' hab.') */
  suffix?: string;
  /** Préfixe */
  prefix?: string;
  /** Fonction de formatage custom */
  formatter?: (value: any, item: T) => string;
}

export interface PopupConfig<T = any> {
  /** Titre du popup */
  title: string | ((d: T) => string);
  /** Champs à afficher dans le popup */
  fields: PopupFieldConfig<T>[];
  /** Afficher un mini-graphique (barres horizontales, pie, etc.) */
  chart?: {
    type: 'horizontal-bars' | 'pie' | 'donut' | 'sparkline';
    dataKey: string;
    labelKey?: string;
    colorKey?: string;
    colors?: Record<string, string>;
  };
  /** Boutons d'action dans le popup */
  actions?: {
    label: string;
    icon?: string;
    /** Événement émis (ex. 'drill-down', 'open-detail') */
    event: string;
  }[];
  /** Largeur du popup en pixels */
  width?: number;
}

// ─── Configuration de la légende ──────────────────────────────────

export interface LegendConfig {
  /** Titre de la légende */
  title: string;
  /** Type : gradient continu ou items discrets */
  type: 'gradient' | 'items';
  /** Pour gradient : colorScale du dataset actif */
  colorScale?: ColorScale;
  /** Pour items : liste de catégories */
  items?: { label: string; color: string; count?: number }[];
  /** Position sur la carte */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

// ─── Configuration du sidebar ─────────────────────────────────────

export interface SidebarMetric {
  label: string;
  value: string | number;
  icon?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: string;
}

export interface SidebarConfig {
  title: string;
  subtitle?: string;
  /** Métriques clés en haut du sidebar */
  metrics?: SidebarMetric[] | (() => SidebarMetric[]);
  /** Composant Vue dynamique pour contenu custom */
  component?: string | Component;
  /** Props à passer au composant custom */
  componentProps?: Record<string, any>;
  /** Largeur en pixels (défaut: 384 = w-96) */
  width?: number;
  /** Collapsible */
  collapsible?: boolean;
}

// ─── Configuration des filtres ────────────────────────────────────

export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'multi-select' | 'range' | 'toggle' | 'date-range' | 'search';
  options?: { label: string; value: string | number }[];
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
  /** Fonction de filtrage : reçoit l'item et la valeur du filtre */
  apply: (item: any, filterValue: any) => boolean;
}

// ─── Configuration des contrôles carte ────────────────────────────

export interface MapControlsConfig {
  zoom?: boolean;
  /** Boutons zoom +/-/reset */
  navigation?: boolean;
  /** Toggles on/off par couche */
  layerToggles?: boolean;
  /** Slider temporel */
  timeSlider?: {
    ranges: { label: string; value: string }[];
    default: string;
  };
  /** Boutons de navigation rapide */
  regionPresets?: boolean;
  /** Barre de recherche par nom de région/département */
  search?: boolean;
  /** Bouton dark/light */
  themeToggle?: boolean;
  /** Bouton plein écran */
  fullscreen?: boolean;
  /** Export PNG / données CSV */
  export?: boolean;
}

// ─── Preset de navigation ─────────────────────────────────────────

export interface MapRegionPreset {
  id: string;
  label: string;
  lng: number;
  lat: number;
  zoom: number;
}

// ─── Viewport réactif ─────────────────────────────────────────────

export interface MapViewport {
  center: [number, number];
  zoom: number;
  bounds?: [[number, number], [number, number]];
  bearing?: number;
  pitch?: number;
}

// ─── Popup state ──────────────────────────────────────────────────

export interface MapPopupState {
  visible: boolean;
  config: PopupConfig | null;
  data: any;
  position: { x: number; y: number };
  layerId: string;
}

// ─── Région du Sénégal ────────────────────────────────────────────

export interface SenegalRegion {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  departments: string[];
  population: number;
}

// ─── Configuration globale de la carte ────────────────────────────

export interface SenegalMapConfig {
  /** Titre de la page/carte */
  title: string;
  /** Description courte */
  description?: string;
  /** Thème par défaut */
  theme?: 'dark' | 'light';
  /** Centre initial [lng, lat] */
  center?: [number, number];
  /** Zoom initial */
  zoom?: number;
  /** Mode d'interaction : 'flat' (2D only) ou '3d' (pitch/rotation) */
  interactionMode?: 'flat' | '3d';
  /** Presets de navigation */
  presets?: MapRegionPreset[];
  /** Datasets / couches à afficher */
  datasets: MapDatasetConfig[];
  /** Sidebar */
  sidebar?: SidebarConfig;
  /** Légende */
  legend?: LegendConfig | ((activeDataset: string) => LegendConfig);
  /** Filtres */
  filters?: FilterConfig[];
  /** Contrôles */
  controls?: MapControlsConfig;
}

// ─── Types utilitaires ────────────────────────────────────────────

export type GeoJsonRegions = FeatureCollection<Geometry, { code: string; name: string }>;
export type GeoJsonFeature = Feature<Geometry, Record<string, any>>;
