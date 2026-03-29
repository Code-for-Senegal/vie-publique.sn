<script setup lang="ts">
import type { SenegalMapConfig, RGBAColor } from '~~/types/map';
import { SENEGAL_REGIONS } from '~/config/map-regions';
import type { PublicProject } from '~~/types/public-project';

interface Props {
  projects: PublicProject[];
}

const props = defineProps<Props>();

// ─── Thème : synchroniser avec le dark mode global ────────────────
const colorMode = useColorMode();
const mapStore = useMapStore();
const mapTheme = computed<'dark' | 'light'>(() => (colorMode.value === 'dark' ? 'dark' : 'light'));

// Synchroniser le store après le mount (initFromConfig l'écrase sinon)
onMounted(() => {
  mapStore.theme = mapTheme.value;
});
watch(mapTheme, (t) => {
  mapStore.theme = t;
});

// ─── Normalisation / matching régions ─────────────────────────────
const normalize = (str: string): string =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const isNational = (label: string | null): boolean => {
  if (!label) return false;
  const n = normalize(label);
  return n === 'national' || n.startsWith('multi');
};

const nameToCode = new Map<string, string>();
for (const r of SENEGAL_REGIONS) {
  nameToCode.set(normalize(r.name), r.code);
}
nameToCode.set('thies', 'TH');
nameToCode.set('saint louis', 'SL');
nameToCode.set('sedhiou', 'SD');
nameToCode.set('kedougou', 'KG');

// ─── Couleurs par région ──────────────────────────────────────────
const REGION_COLORS: Record<string, RGBAColor> = {
  DK: [59, 130, 246, 200], // Bleu — Dakar
  TH: [16, 185, 129, 200], // Émeraude — Thiès
  SL: [245, 158, 11, 200], // Ambre — Saint-Louis
  ZG: [139, 92, 246, 200], // Violet — Ziguinchor
  KL: [236, 72, 153, 200], // Rose — Kaolack
  KD: [6, 182, 212, 200], // Cyan — Kolda
  TC: [249, 115, 22, 200], // Orange — Tambacounda
  KG: [132, 204, 22, 200], // Lime — Kédougou
  MT: [239, 68, 68, 200], // Rouge — Matam
  FK: [99, 102, 241, 200], // Indigo — Fatick
  DB: [20, 184, 166, 200], // Teal — Diourbel
  LG: [234, 179, 8, 200], // Jaune — Louga
  SD: [168, 85, 247, 200], // Mauve — Sédhiou
  KF: [34, 197, 94, 200], // Vert — Kaffrine
};

// ─── Données agrégées par région ──────────────────────────────────
const regionData = computed(() => {
  const counts = new Map<string, number>();
  const nationalCount = props.projects.filter((p) => isNational(p.regionPrimaryLabel)).length;

  for (const project of props.projects) {
    const label = project.regionPrimaryLabel;
    if (!label || isNational(label)) continue;
    const code = nameToCode.get(normalize(label));
    if (code) {
      counts.set(code, (counts.get(code) || 0) + 1);
    }
  }

  return SENEGAL_REGIONS.map((r) => ({
    regionCode: r.code,
    region: r.name,
    projectCount: (counts.get(r.code) || 0) + nationalCount,
  }));
});

// Données pour les marqueurs de comptage (cercle + texte)
const countMarkers = computed(() =>
  regionData.value.map((r) => {
    const info = SENEGAL_REGIONS.find((sr) => sr.code === r.regionCode);
    return {
      lng: info?.longitude || 0,
      lat: info?.latitude || 0,
      count: r.projectCount,
      label: String(r.projectCount),
      regionCode: r.regionCode,
    };
  }),
);

// ─── Config carte ─────────────────────────────────────────────────
const mapConfig = computed<SenegalMapConfig>(() => ({
  title: '',
  theme: mapTheme.value,
  center: [-14.4524, 14.4974],
  zoom: 6.5,
  interactionMode: 'flat',
  datasets: [
    // 1. Choroplèthe — couleurs catégorielles par région
    {
      id: 'projets-par-region',
      label: 'Projets par région',
      type: 'choropleth',
      visible: true,
      data: regionData.value,
      joinField: 'regionCode',
      geoJoinField: 'code',
      getValue: (d: any) => d.projectCount,
      getColor: (d: any) => REGION_COLORS[d.regionCode] || [128, 128, 128, 80],
      colorScale: {
        type: 'category' as const,
        stops: SENEGAL_REGIONS.map((r) => ({
          value: 0,
          color: REGION_COLORS[r.code] || ([128, 128, 128, 80] as RGBAColor),
          label: r.name,
        })),
        fallback: [128, 128, 128, 80] as RGBAColor,
      },
      pickable: true,
      popup: {
        title: (d: any) => d.region,
        fields: [{ key: 'projectCount', label: 'Projets', format: 'number' as const }],
      },
    },
    // 2. Cercles de fond pour les compteurs
    {
      id: 'region-count-circles',
      label: 'Compteurs',
      type: 'scatterplot',
      visible: true,
      data: countMarkers.value,
      getPosition: (d: any) => [d.lng, d.lat],
      getRadius: () => 800,
      getColor: () =>
        mapTheme.value === 'dark'
          ? ([30, 30, 30, 220] as RGBAColor)
          : ([255, 255, 255, 230] as RGBAColor),
      radiusMinPixels: 14,
      radiusMaxPixels: 22,
      pickable: false,
    },
    // 3. Texte des compteurs
    {
      id: 'region-count-labels',
      label: 'Labels compteurs',
      type: 'text',
      visible: true,
      data: countMarkers.value,
      getPosition: (d: any) => [d.lng, d.lat],
      getLabel: (d: any) => d.label,
      pickable: false,
    },
  ],
  legend: {
    title: 'Régions',
    type: 'category',
    colorScale: {
      type: 'category' as const,
      stops: SENEGAL_REGIONS.map((r) => ({
        value: 0,
        color: REGION_COLORS[r.code] || ([128, 128, 128, 80] as RGBAColor),
        label: r.name,
      })),
      fallback: [128, 128, 128, 80] as RGBAColor,
    },
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
    class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
  >
    <div
      class="flex items-center justify-between border-b border-gray-200 px-4 py-2.5 dark:border-gray-700"
    >
      <h3 class="text-sm font-bold text-gray-900 dark:text-white">
        Répartition géographique des projets
      </h3>
    </div>

    <div v-if="projects.length > 0" class="dashboard-map relative" style="height: 380px">
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

    <p v-else class="py-8 text-center text-sm text-gray-400">Aucune donnée</p>
  </div>
</template>

<style scoped>
.dashboard-map :deep(.senegal-map) {
  height: 100% !important;
}
</style>
