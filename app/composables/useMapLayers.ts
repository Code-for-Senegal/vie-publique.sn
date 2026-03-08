// app/composables/useMapLayers.ts
// MOTEUR — Transforme MapDatasetConfig[] en Layer[] deck.gl.
// C'est le cœur du système configurable.

import { computed, type Ref } from 'vue';
import type {
  MapDatasetConfig,
  ColorScale,
  RGBAColor,
  MapViewport,
  FilterConfig,
} from '~~/types/map';
import type { FeatureCollection } from 'geojson';

interface UseMapLayersOptions {
  datasets: Ref<MapDatasetConfig[]>;
  geoJsonRegions: Ref<FeatureCollection | null>;
  geoJsonDepartements?: Ref<FeatureCollection | null>;
  geoJsonCommunes?: Ref<FeatureCollection | null>;
  theme: Ref<'dark' | 'light'>;
  activeFilters: Ref<Record<string, any>>;
  filterConfigs: Ref<FilterConfig[]>;
  viewport: Ref<MapViewport>;
  layerVisibility: Ref<Record<string, boolean>>;
}

// ─── Utilitaires couleur ─────────────────────────────────────────

function interpolateColor(value: number, colorScale: ColorScale): RGBAColor {
  const { stops, fallback } = colorScale;
  if (stops.length === 0) return fallback;
  if (value <= stops[0].value) return stops[0].color;
  if (value >= stops[stops.length - 1].value) return stops[stops.length - 1].color;

  for (let i = 0; i < stops.length - 1; i++) {
    const s0 = stops[i];
    const s1 = stops[i + 1];
    if (value >= s0.value && value <= s1.value) {
      if (colorScale.type === 'threshold') {
        return s0.color;
      }
      // Linear interpolation
      const t = (value - s0.value) / (s1.value - s0.value);
      return [
        Math.round(s0.color[0] + t * (s1.color[0] - s0.color[0])),
        Math.round(s0.color[1] + t * (s1.color[1] - s0.color[1])),
        Math.round(s0.color[2] + t * (s1.color[2] - s0.color[2])),
        Math.round(s0.color[3] + t * (s1.color[3] - s0.color[3])),
      ];
    }
  }
  return fallback;
}

function applyFilters(
  data: any[],
  filters: FilterConfig[],
  activeFilters: Record<string, any>,
): any[] {
  if (!filters.length) return data;
  return data.filter((item) => {
    return filters.every((f) => {
      const val = activeFilters[f.id];
      if (val === undefined || val === null) return true;
      return f.apply(item, val);
    });
  });
}

// ─── Calcul du centroïde d'une feature GeoJSON ──────────────────

function computeCentroid(feature: any): [number, number] {
  const coords: number[][] = [];

  function collectCoords(geometry: any) {
    if (!geometry) return;
    if (geometry.type === 'Polygon') {
      // Utiliser uniquement l'anneau extérieur
      for (const coord of geometry.coordinates[0]) {
        coords.push(coord);
      }
    } else if (geometry.type === 'MultiPolygon') {
      for (const polygon of geometry.coordinates) {
        for (const coord of polygon[0]) {
          coords.push(coord);
        }
      }
    }
  }

  collectCoords(feature.geometry);

  if (coords.length === 0) return [0, 0];

  let sumLng = 0;
  let sumLat = 0;
  for (const c of coords) {
    sumLng += c[0];
    sumLat += c[1];
  }
  return [sumLng / coords.length, sumLat / coords.length];
}

export function useMapLayers(options: UseMapLayersOptions) {
  const {
    datasets,
    geoJsonRegions,
    geoJsonDepartements,
    geoJsonCommunes,
    theme,
    activeFilters,
    filterConfigs,
    viewport,
    layerVisibility,
  } = options;

  // ─── Computed : reconstruit TOUTES les couches deck.gl ─────────
  const layers = computed<any[]>(() => {
    const result: any[] = [];
    const currentZoom = viewport.value.zoom;

    for (const ds of datasets.value) {
      // Vérifier la visibilité
      if (layerVisibility.value[ds.id] === false) continue;

      // Vérifier les bornes de zoom
      if (ds.minZoom !== undefined && currentZoom < ds.minZoom) continue;
      if (ds.maxZoom !== undefined && currentZoom > ds.maxZoom) continue;

      // Filtrer les données
      const filteredData = applyFilters(ds.data, filterConfigs.value, activeFilters.value);

      try {
        const layer = buildLayer(ds, filteredData, currentZoom);
        if (layer) {
          // buildLayer peut retourner un tableau (ex: choropleth + labels)
          if (Array.isArray(layer)) {
            result.push(...layer);
          } else {
            result.push(layer);
          }
        }
      } catch (err) {
        console.warn(`[useMapLayers] Erreur construction couche "${ds.id}":`, err);
      }
    }

    return result;
  });

  // ─── Factory de couches ────────────────────────────────────────

  function buildLayer(ds: MapDatasetConfig, data: any[], _zoom: number): any | any[] | null {
    // Import dynamique — ces modules ne sont disponibles que côté client
    // On utilise un pattern qui crée les couches via des classes importées
    // Les imports sont faits au top-level dans le composant SenegalMap
    // Ici on retourne des objets de config que le composant transformera
    switch (ds.type) {
      case 'choropleth':
        return buildChoroplethConfig(ds, data);
      case 'scatterplot':
        return buildScatterplotConfig(ds, data);
      case 'heatmap':
        return buildHeatmapConfig(ds, data);
      case 'arc':
        return buildArcConfig(ds, data);
      case 'path':
        return buildPathConfig(ds, data);
      case 'text':
        return buildTextConfig(ds, data);
      case 'icon':
        return buildIconConfig(ds, data);
      case 'cluster':
        return buildClusterConfig(ds, data);
      case 'geojson':
        return buildGeoJsonConfig(ds, data);
      default:
        console.warn(`[useMapLayers] Type de couche inconnu: ${ds.type}`);
        return null;
    }
  }

  // ─── Choroplèthe (GeoJsonLayer) ────────────────────────────────

  function buildChoroplethConfig(ds: MapDatasetConfig, data: any[]) {
    const geoJson = geoJsonRegions.value;
    if (!geoJson) return null;

    // Construire un Map pour le join rapide
    const dataMap = new Map<string, any>();
    const joinField = ds.joinField ?? 'regionCode';
    for (const item of data) {
      const key = item[joinField];
      if (key) dataMap.set(key, item);
    }

    const geoJoinField = ds.geoJoinField ?? 'code';

    // Créer une copie enrichie des features GeoJSON
    const enrichedFeatures: any[] = geoJson.features.map((feature) => {
      const code = feature.properties?.[geoJoinField];
      const itemData = code ? dataMap.get(code) : null;
      return {
        ...feature,
        properties: {
          ...feature.properties,
          _mapData: itemData,
          _hasData: !!itemData,
        },
      };
    });

    const isPickable = ds.pickable ?? true;

    const choropleth = {
      _type: 'choropleth',
      _dsId: ds.id,
      id: `layer-${ds.id}`,
      data: { ...geoJson, features: enrichedFeatures },
      pickable: isPickable,
      autoHighlight: isPickable,
      highlightColor: [255, 255, 255, 50],
      stroked: true,
      filled: true,
      lineWidthMinPixels: 1,
      opacity: (ds.opacity ?? 200) / 255,
      getLineColor: theme.value === 'dark' ? [255, 255, 255, 60] : [0, 0, 0, 40],
      getFillColor: (feature: any) => {
        const itemData = feature.properties?._mapData;
        if (!itemData) return ds.colorScale?.fallback ?? [128, 128, 128, 80];

        if (ds.getColor) return ds.getColor(itemData);
        if (ds.getValue && ds.colorScale) {
          const val = ds.getValue(itemData);
          return interpolateColor(val, ds.colorScale);
        }
        return ds.colorScale?.fallback ?? [128, 128, 128, 80];
      },
      updateTriggers: {
        getFillColor: [data.length, JSON.stringify(Object.keys(activeFilters.value))],
        getLineColor: [theme.value],
      },
    };

    const currentZoom = viewport.value.zoom;
    const layers: any[] = [choropleth];

    // ─── Labels des régions (toujours visibles) ──────────────────
    const regionLabelData = (enrichedFeatures as any[])
      .map((feature: any) => {
        const centroid = computeCentroid(feature);
        const name = feature.properties?.name ?? feature.properties?.region ?? '';
        return { position: centroid, name };
      })
      .filter((d: any) => d.name && d.position[0] !== 0);

    layers.push({
      _type: 'text',
      _dsId: ds.id,
      id: `layer-${ds.id}-region-labels`,
      data: regionLabelData,
      pickable: false,
      getPosition: (d: any) => d.position,
      getText: (d: any) => d.name,
      getSize: currentZoom >= 8 ? 15 : 13,
      getColor: theme.value === 'dark' ? [255, 255, 255, 230] : [0, 0, 0, 230],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 700,
      outlineWidth: 3,
      outlineColor: theme.value === 'dark' ? [0, 0, 0, 220] : [255, 255, 255, 220],
      sizeUnits: 'pixels',
      billboard: false,
      updateTriggers: {
        getColor: [theme.value],
        getSize: [currentZoom],
      },
    });

    // ─── Départements : bordures + labels (zoom ≥ 7) ────────────
    const deptGeojson = geoJsonDepartements?.value;
    if (deptGeojson && currentZoom >= 7) {
      // Bordures départements
      layers.push({
        _type: 'geojson',
        _dsId: ds.id,
        id: `layer-${ds.id}-dept-borders`,
        data: deptGeojson,
        pickable: false,
        stroked: true,
        filled: false,
        lineWidthMinPixels: 1,
        opacity: currentZoom >= 9 ? 0.6 : 0.35,
        getLineColor: theme.value === 'dark' ? [255, 255, 255, 100] : [0, 0, 0, 70],
        updateTriggers: {
          getLineColor: [theme.value],
        },
      });

      // Labels départements
      const deptLabelData = deptGeojson.features
        .map((feature) => {
          const centroid = computeCentroid(feature);
          const name = feature.properties?.name ?? feature.properties?.department ?? '';
          return { position: centroid, name };
        })
        .filter((d) => d.name && d.position[0] !== 0);

      layers.push({
        _type: 'text',
        _dsId: ds.id,
        id: `layer-${ds.id}-dept-labels`,
        data: deptLabelData,
        pickable: false,
        getPosition: (d: any) => d.position,
        getText: (d: any) => d.name,
        getSize: currentZoom >= 9 ? 12 : 10,
        getColor: theme.value === 'dark' ? [200, 220, 255, 200] : [40, 40, 80, 200],
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: 500,
        outlineWidth: 2,
        outlineColor: theme.value === 'dark' ? [0, 0, 0, 180] : [255, 255, 255, 180],
        sizeUnits: 'pixels',
        billboard: false,
        updateTriggers: {
          getColor: [theme.value],
          getSize: [currentZoom],
        },
      });
    }

    // ─── Labels des communes (zoom ≥ 9) ─────────────────────────
    const communeGeojson = geoJsonCommunes?.value;
    if (communeGeojson && currentZoom >= 9) {
      const communeLabelData = communeGeojson.features
        .map((feature) => {
          const coords = feature.geometry?.coordinates;
          const name = feature.properties?.name ?? '';
          if (!coords || !name) return null;
          return { position: [coords[0], coords[1]], name };
        })
        .filter(Boolean);

      layers.push({
        _type: 'text',
        _dsId: ds.id,
        id: `layer-${ds.id}-commune-labels`,
        data: communeLabelData,
        pickable: false,
        getPosition: (d: any) => d.position,
        getText: (d: any) => d.name,
        getSize: currentZoom >= 11 ? 11 : 9,
        getColor: theme.value === 'dark' ? [180, 200, 240, 170] : [60, 60, 100, 170],
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: 400,
        fontStyle: 'italic',
        outlineWidth: 2,
        outlineColor: theme.value === 'dark' ? [0, 0, 0, 160] : [255, 255, 255, 160],
        sizeUnits: 'pixels',
        billboard: false,
        updateTriggers: {
          getColor: [theme.value],
          getSize: [currentZoom],
        },
      });
    }

    return layers;
  }

  // ─── Scatterplot ───────────────────────────────────────────────

  function buildScatterplotConfig(ds: MapDatasetConfig, data: any[]) {
    const isPickable = ds.pickable ?? true;
    return {
      _type: 'scatterplot',
      _dsId: ds.id,
      id: `layer-${ds.id}`,
      data,
      pickable: isPickable,
      autoHighlight: isPickable,
      highlightColor: [255, 255, 255, 80],
      opacity: (ds.opacity ?? 200) / 255,
      stroked: true,
      filled: true,
      radiusMinPixels: ds.radiusMinPixels ?? 3,
      radiusMaxPixels: ds.radiusMaxPixels ?? 30,
      radiusScale: ds.radiusScale ?? 1,
      lineWidthMinPixels: 1,
      getPosition: ds.getPosition ?? ((d: any) => [d.lng, d.lat]),
      getRadius: ds.getRadius ?? (() => 100),
      getFillColor: ds.getColor ?? (() => [59, 130, 246, 200] as RGBAColor),
      getLineColor: () => [255, 255, 255, 100] as RGBAColor,
      updateTriggers: {
        getPosition: [data.length],
        getRadius: [data.length],
        getFillColor: [data.length],
      },
    };
  }

  // ─── Heatmap ───────────────────────────────────────────────────

  function buildHeatmapConfig(ds: MapDatasetConfig, data: any[]) {
    return {
      _type: 'heatmap',
      _dsId: ds.id,
      id: `layer-${ds.id}`,
      data,
      pickable: false,
      opacity: (ds.opacity ?? 180) / 255,
      getPosition: ds.getPosition ?? ((d: any) => [d.lng, d.lat]),
      getWeight: ds.getValue ?? (() => 1),
      radiusPixels: 60,
      intensity: 1,
      threshold: 0.05,
      updateTriggers: {
        getPosition: [data.length],
        getWeight: [data.length],
      },
    };
  }

  // ─── Arc ───────────────────────────────────────────────────────

  function buildArcConfig(ds: MapDatasetConfig, data: any[]) {
    return {
      _type: 'arc',
      _dsId: ds.id,
      id: `layer-${ds.id}`,
      data,
      pickable: ds.pickable ?? false,
      opacity: (ds.opacity ?? 200) / 255,
      getSourcePosition: ds.getSourcePosition ?? ((d: any) => [d.origineLng, d.origineLat]),
      getTargetPosition: ds.getTargetPosition ?? ((d: any) => [d.destLng, d.destLat]),
      getSourceColor: ds.getSourceColor ?? (() => [0, 200, 255, 200] as RGBAColor),
      getTargetColor: ds.getTargetColor ?? (() => [255, 100, 50, 200] as RGBAColor),
      getWidth: ds.getWidth ?? 2,
      updateTriggers: {
        getSourcePosition: [data.length],
        getTargetPosition: [data.length],
      },
    };
  }

  // ─── Path ──────────────────────────────────────────────────────

  function buildPathConfig(ds: MapDatasetConfig, data: any[]) {
    return {
      _type: 'path',
      _dsId: ds.id,
      id: `layer-${ds.id}`,
      data,
      pickable: ds.pickable ?? false,
      opacity: (ds.opacity ?? 200) / 255,
      widthMinPixels: ds.lineWidth ?? 2,
      getPath: (d: any) => d.path ?? d.coordinates ?? [],
      getColor: ds.getColor ?? (() => [59, 130, 246, 200] as RGBAColor),
      updateTriggers: {
        getPath: [data.length],
        getColor: [data.length],
      },
    };
  }

  // ─── Text ──────────────────────────────────────────────────────

  function buildTextConfig(ds: MapDatasetConfig, data: any[]) {
    return {
      _type: 'text',
      _dsId: ds.id,
      id: `layer-${ds.id}`,
      data,
      pickable: ds.pickable ?? false,
      getPosition: ds.getPosition ?? ((d: any) => [d.lng, d.lat]),
      getText: ds.getLabel ?? ((d: any) => d.label ?? d.name ?? ''),
      getSize: 14,
      getColor: theme.value === 'dark' ? [255, 255, 255, 230] : [0, 0, 0, 230],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: 600,
      outlineWidth: 2,
      outlineColor: theme.value === 'dark' ? [0, 0, 0, 200] : [255, 255, 255, 200],
      updateTriggers: {
        getText: [data.length],
        getColor: [theme.value],
      },
    };
  }

  // ─── Icon ──────────────────────────────────────────────────────

  function buildIconConfig(ds: MapDatasetConfig, data: any[]) {
    const isPickable = ds.pickable ?? true;
    return {
      _type: 'icon',
      _dsId: ds.id,
      id: `layer-${ds.id}`,
      data,
      pickable: isPickable,
      autoHighlight: isPickable,
      highlightColor: [255, 255, 255, 80],
      opacity: (ds.opacity ?? 255) / 255,
      getPosition: ds.getPosition ?? ((d: any) => [d.lng, d.lat]),
      getColor: ds.getColor ?? (() => [59, 130, 246, 200] as RGBAColor),
      getSize: ds.getRadius ?? (() => 24),
      // Fallback : on utilise ScatterplotLayer pour les icônes
      // (IconLayer nécessite un icon atlas, on simplifie via scatterplot coloré)
      radiusMinPixels: ds.radiusMinPixels ?? 6,
      radiusMaxPixels: ds.radiusMaxPixels ?? 20,
      updateTriggers: {
        getPosition: [data.length],
        getColor: [data.length],
      },
    };
  }

  // ─── Cluster ───────────────────────────────────────────────────

  function buildClusterConfig(ds: MapDatasetConfig, data: any[]) {
    // Le clustering est géré dans SenegalMap.vue via useSupercluster
    // Ici on retourne une config marqueur pour les clusters résolus
    return {
      _type: 'cluster',
      _dsId: ds.id,
      id: `layer-${ds.id}`,
      data,
      pickable: ds.pickable ?? true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 80],
      getPosition: ds.getPosition ?? ((d: any) => [d.lng, d.lat]),
      getRadius: ds.getRadius ?? (() => 100),
      radiusMinPixels: ds.radiusMinPixels ?? 4,
      radiusMaxPixels: ds.radiusMaxPixels ?? 25,
      getColor: ds.getColor ?? (() => [59, 130, 246, 200] as RGBAColor),
      clusterRadius: ds.clusterRadius ?? 60,
      clusterMaxZoom: ds.clusterMaxZoom ?? 16,
      updateTriggers: {
        getPosition: [data.length],
        getRadius: [data.length],
        getColor: [data.length],
      },
    };
  }

  // ─── GeoJSON brut ──────────────────────────────────────────────

  function buildGeoJsonConfig(ds: MapDatasetConfig, data: any[]) {
    return {
      _type: 'geojson',
      _dsId: ds.id,
      id: `layer-${ds.id}`,
      data:
        data.length > 0 && data[0]?.type === 'FeatureCollection'
          ? data[0]
          : { type: 'FeatureCollection', features: data },
      pickable: ds.pickable ?? false,
      stroked: true,
      filled: true,
      lineWidthMinPixels: ds.lineWidth ?? 1,
      opacity: (ds.opacity ?? 200) / 255,
      getFillColor: ds.getColor ?? (() => [59, 130, 246, 100] as RGBAColor),
      getLineColor: ds.getColor ?? (() => [59, 130, 246, 200] as RGBAColor),
      updateTriggers: {
        getFillColor: [data.length],
        getLineColor: [data.length],
      },
    };
  }

  return {
    layers,
    interpolateColor,
  };
}
