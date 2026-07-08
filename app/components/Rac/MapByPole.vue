<script setup lang="ts">
import type { SenegalMapConfig, RGBAColor } from '~~/types/map';
import { SENEGAL_REGIONS } from '~/config/map-regions';

interface PoleMapping {
  poles: { slug: string; name: string; regions: string[] }[];
  regions_to_pole: Record<string, string>;
}

interface DatasetValue {
  pole: string;
  value: number;
}

interface RacDataset {
  id: string;
  title: string;
  unit: string;
  values?: DatasetValue[];
  note?: string;
  insights?: string[];
}

interface Props {
  datasets: RacDataset[];
  poleMapping: PoleMapping;
}

const props = defineProps<Props>();

// ─── Thème : synchroniser avec le dark mode global ────────────────
const colorMode = useColorMode();
const mapStore = useMapStore();
const mapTheme = computed<'dark' | 'light'>(() => (colorMode.value === 'dark' ? 'dark' : 'light'));

onMounted(() => {
  mapStore.theme = mapTheme.value;
});
watch(mapTheme, (t) => {
  mapStore.theme = t;
});

// ─── Datasets avec valeurs uniquement ─────────────────────────────
const validDatasets = computed(() =>
  props.datasets.filter((ds) => ds.values && ds.values.length > 0),
);

// ─── Sélection du dataset actif ───────────────────────────────────
const selectedDatasetId = ref(validDatasets.value[0]?.id ?? '');

const activeDataset = computed(
  () =>
    validDatasets.value.find((ds) => ds.id === selectedDatasetId.value) ?? validDatasets.value[0],
);

// ─── Couleurs par pôle (8 couleurs distinctes) ────────────────────
const POLE_COLORS: Record<string, RGBAColor> = {
  dakar: [59, 130, 246, 200], // Blue
  thies: [16, 185, 129, 200], // Emerald
  'diourbel-louga': [245, 158, 11, 200], // Amber
  centre: [139, 92, 246, 200], // Violet
  nord: [236, 72, 153, 200], // Pink
  'nord-est': [249, 115, 22, 200], // Orange
  'sud-est': [132, 204, 22, 200], // Lime
  sud: [6, 182, 212, 200], // Cyan
};

// ─── Normalisation des noms de pôles ──────────────────────────────
const normalize = (str: string): string =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

// Construire un lookup : nom de pôle normalisé → slug
const poleNameToSlug = computed(() => {
  const map = new Map<string, string>();
  for (const pole of props.poleMapping.poles) {
    map.set(normalize(pole.name), pole.slug);
    // Aussi le slug comme clé
    map.set(normalize(pole.slug), pole.slug);
    // Et le nom court (ex: "Nord", "Sud", "Centre")
    const shortName = pole.name.replace(/^Pôle\s+/i, '');
    map.set(normalize(shortName), pole.slug);
  }
  return map;
});

// ─── Lookup : region name → pole slug ─────────────────────────────
const regionNameToCode = computed(() => {
  const map = new Map<string, string>();
  for (const r of SENEGAL_REGIONS) {
    map.set(
      r.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''),
      r.code,
    );
  }
  return map;
});

// ─── Données cartographiques par région (héritent du pôle) ───────
const regionData = computed(() => {
  const ds = activeDataset.value;
  if (!ds?.values) return [];

  // Construire un map pole-slug → valeur
  const poleValues = new Map<string, number>();
  for (const v of ds.values) {
    const slug = poleNameToSlug.value.get(normalize(v.pole));
    if (slug) {
      poleValues.set(slug, v.value);
    }
  }

  // Projeter sur chaque région
  return SENEGAL_REGIONS.map((r) => {
    const poleSlug = props.poleMapping.regions_to_pole[r.name];
    const value = poleSlug ? (poleValues.get(poleSlug) ?? 0) : 0;
    const pole = props.poleMapping.poles.find((p) => p.slug === poleSlug);
    return {
      regionCode: r.code,
      region: r.name,
      poleName: pole?.name ?? '—',
      poleSlug: poleSlug ?? '',
      value,
    };
  });
});

// ─── Marqueurs de valeur (centre de chaque pôle) ─────────────────
const poleMarkers = computed(() => {
  const ds = activeDataset.value;
  if (!ds?.values) return [];

  return props.poleMapping.poles
    .map((pole) => {
      // Trouver la valeur du dataset pour ce pôle
      const dataValue = ds.values!.find(
        (v) => poleNameToSlug.value.get(normalize(v.pole)) === pole.slug,
      );
      if (!dataValue) return null;

      // Calculer le centre géographique du pôle
      const poleRegions = pole.regions
        .map((rName) => {
          const code = regionNameToCode.value.get(
            rName
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, ''),
          );
          return SENEGAL_REGIONS.find((r) => r.code === code);
        })
        .filter(Boolean) as (typeof SENEGAL_REGIONS)[number][];

      if (!poleRegions.length) return null;

      const avgLng = poleRegions.reduce((s, r) => s + r.longitude, 0) / poleRegions.length;
      const avgLat = poleRegions.reduce((s, r) => s + r.latitude, 0) / poleRegions.length;

      const formatted =
        dataValue.value >= 1_000_000
          ? `${(dataValue.value / 1_000_000).toFixed(1)}M`
          : dataValue.value >= 1_000
            ? `${(dataValue.value / 1_000).toFixed(0)}k`
            : String(dataValue.value);

      return {
        lng: avgLng,
        lat: avgLat,
        label: formatted,
        poleName: pole.name,
        poleSlug: pole.slug,
        value: dataValue.value,
      };
    })
    .filter(Boolean);
});

// ─── Config carte ─────────────────────────────────────────────────
const mapConfig = computed<SenegalMapConfig>(() => ({
  title: '',
  theme: mapTheme.value,
  center: [-14.4524, 14.4974],
  zoom: 6.5,
  interactionMode: 'flat',
  datasets: [
    // 1. Choroplèthe — régions colorées par pôle
    {
      id: 'rac-poles',
      label: activeDataset.value?.title ?? 'Données par pôle',
      type: 'choropleth',
      visible: true,
      data: regionData.value,
      joinField: 'regionCode',
      geoJoinField: 'code',
      getValue: (d: any) => d.value,
      getColor: (d: any) => POLE_COLORS[d.poleSlug] || [128, 128, 128, 80],
      colorScale: {
        type: 'category' as const,
        stops: props.poleMapping.poles.map((p) => ({
          value: 0,
          color: POLE_COLORS[p.slug] || ([128, 128, 128, 80] as RGBAColor),
          label: p.name,
        })),
        fallback: [128, 128, 128, 80] as RGBAColor,
      },
      pickable: true,
      popup: {
        title: (d: any) => d.poleName,
        fields: [
          { key: 'region', label: 'Région', format: 'text' as const },
          {
            key: 'value',
            label: activeDataset.value?.unit ?? 'Valeur',
            format: 'number' as const,
            suffix: activeDataset.value?.unit ? ` ${activeDataset.value.unit}` : '',
          },
        ],
      },
    },
    // 2. Cercles de fond pour les valeurs
    {
      id: 'pole-value-circles',
      label: 'Cercles valeurs',
      type: 'scatterplot',
      visible: true,
      data: poleMarkers.value as any[],
      getPosition: (d: any) => [d.lng, d.lat],
      getRadius: () => 900,
      getColor: () =>
        mapTheme.value === 'dark'
          ? ([30, 30, 30, 220] as RGBAColor)
          : ([255, 255, 255, 230] as RGBAColor),
      radiusMinPixels: 16,
      radiusMaxPixels: 24,
      pickable: false,
    },
    // 3. Labels des valeurs
    {
      id: 'pole-value-labels',
      label: 'Labels valeurs',
      type: 'text',
      visible: true,
      data: poleMarkers.value as any[],
      getPosition: (d: any) => [d.lng, d.lat],
      getLabel: (d: any) => d.label,
      pickable: false,
    },
  ],
  legend: {
    title: 'Pôles territoriaux',
    type: 'items',
    items: props.poleMapping.poles.map((p) => {
      const c = POLE_COLORS[p.slug] || [128, 128, 128, 80];
      return {
        label: p.name,
        color: `rgb(${c[0]},${c[1]},${c[2]})`,
      };
    }),
    position: 'bottom-left',
  },
  controls: {
    zoom: true,
    themeToggle: true,
    export: true,
  },
}));
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700/50 dark:bg-gray-900/80"
  >
    <!-- Header avec sélecteur -->
    <div
      class="flex flex-col gap-2 border-b border-gray-200 px-4 py-2.5 dark:border-gray-700/50 sm:flex-row sm:items-center sm:justify-between"
    >
      <h3 class="text-sm font-bold text-gray-900 dark:text-white">
        Répartition territoriale par pôle
      </h3>
      <select
        v-if="validDatasets.length > 1"
        v-model="selectedDatasetId"
        class="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
      >
        <option v-for="ds in validDatasets" :key="ds.id" :value="ds.id">
          {{ ds.title }}
        </option>
      </select>
    </div>

    <!-- Carte -->
    <div v-if="regionData.length > 0" class="dashboard-map relative" style="height: 380px">
      <ClientOnly>
        <MapSenegalMap :config="mapConfig" />
        <template #fallback>
          <div class="flex h-full items-center justify-center">
            <div class="text-center">
              <div
                class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"
              />
              <p class="text-xs text-gray-500">Chargement de la carte...</p>
            </div>
          </div>
        </template>
      </ClientOnly>
    </div>
    <p v-else class="py-8 text-center text-sm text-gray-400">
      Aucune donnée cartographiable pour ce dataset
    </p>

    <!-- Insights -->
    <div
      v-if="activeDataset?.insights?.length"
      class="border-t border-gray-200 px-4 py-3 dark:border-gray-700/50"
    >
      <ul class="space-y-1">
        <li
          v-for="(insight, i) in activeDataset.insights"
          :key="i"
          class="flex gap-2 text-xs text-gray-600 dark:text-gray-400"
        >
          <UIcon
            name="i-heroicons-light-bulb-20-solid"
            class="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500"
          />
          {{ insight }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.dashboard-map :deep(.senegal-map) {
  height: 100% !important;
}
</style>
