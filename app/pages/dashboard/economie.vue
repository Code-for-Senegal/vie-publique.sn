<script setup lang="ts">
import type { SenegalMapConfig, RGBAColor } from '~~/types/map';
import { SENEGAL_REGIONS } from '~/config/map-regions';

definePageMeta({ ssr: false, layout: 'fullscreen' });

useSeoMeta({
  title: 'Dashboard Économique du Sénégal',
  description:
    'Tableau de bord interactif des indicateurs économiques du Sénégal : PIB, croissance, chômage et données régionales.',
});

// ─── Données ────────────────────────────────────────────────────────
const { data: dashboard } = await useFetch<any>('/data/dashboard-economie.json', {
  key: 'dashboard-economie',
  server: false,
  default: () => null,
});

const { data: diaspora } = await useFetch<any[]>('/data/flux-diaspora.json', {
  key: 'flux-diaspora',
  server: false,
  default: () => [],
});

const { data: alertesMigration } = await useFetch<any[]>('/data/alertes-migration.json', {
  key: 'alertes-migration',
  server: false,
  default: () => [],
});

const national = computed(() => dashboard.value?.national);
const evolution = computed<any[]>(() => dashboard.value?.evolution ?? []);
const regions = computed<any[]>(() => dashboard.value?.regions ?? []);
const sources = computed<string[]>(() => dashboard.value?.sources ?? []);
const lastUpdated = computed(() => dashboard.value?.lastUpdated ?? '');
const isReady = computed(() => !!dashboard.value && regions.value.length > 0);

// ─── Filtres globaux ────────────────────────────────────────────────
const activeSectors = ref<string[]>([]);
const activeTendances = ref<string[]>([]);
const activeRegions = ref<string[]>([]);

const availableSectors = computed(() => {
  const set = new Set(regions.value.map((r: any) => r.secteurDominant as string));
  return [...set].sort();
});

const regionOptions = computed(() =>
  SENEGAL_REGIONS.filter((sr) => regions.value.some((r: any) => r.regionCode === sr.code)).map(
    (sr) => ({ code: sr.code, name: sr.name }),
  ),
);

const filteredRegions = computed(() =>
  regions.value.filter((r: any) => {
    if (activeSectors.value.length && !activeSectors.value.includes(r.secteurDominant))
      return false;
    if (activeTendances.value.length && !activeTendances.value.includes(r.tendance)) return false;
    if (activeRegions.value.length && !activeRegions.value.includes(r.regionCode)) return false;
    return true;
  }),
);

function resetFilters() {
  activeSectors.value = [];
  activeTendances.value = [];
  activeRegions.value = [];
}

const hasActiveFilters = computed(
  () =>
    activeSectors.value.length > 0 ||
    activeTendances.value.length > 0 ||
    activeRegions.value.length > 0,
);

// ─── Gauge métriques (3 arcs) ────────────────────────────────────────
const gaugeMetrics = computed(() => {
  const n = national.value;
  const filtered = filteredRegions.value;
  if (!n || !filtered.length) return [];

  const totalPop = filtered.reduce((s: number, r: any) => s + r.population, 0);
  const avgChomage =
    totalPop > 0
      ? filtered.reduce((s: number, r: any) => s + r.tauxChomage * r.population, 0) / totalPop
      : 0;
  const pibCoverage =
    (filtered.reduce((s: number, r: any) => s + r.pibTotal, 0) / n.pibTotal) * 100;
  const popCoverage = (totalPop / n.population) * 100;

  return [
    { label: 'Chômage moy.', value: avgChomage, max: 40, unit: '%', color: '#f59e0b' },
    { label: 'Couverture PIB', value: pibCoverage, max: 100, unit: '%', color: '#22c55e' },
    { label: 'Couverture Pop.', value: popCoverage, max: 100, unit: '%', color: '#3b82f6' },
  ];
});

// ─── KPI cards (recalculés selon filtres) ───────────────────────────
const kpis = computed(() => {
  const n = national.value;
  if (!n) return [];

  const filtered = filteredRegions.value;
  const isFiltered = hasActiveFilters.value;

  // Si filtré : recalculer PIB, chômage, population depuis les régions filtrées
  const pibTotal = isFiltered
    ? filtered.reduce((s: number, r: any) => s + r.pibTotal, 0)
    : n.pibTotal;
  const population = isFiltered
    ? filtered.reduce((s: number, r: any) => s + r.population, 0)
    : n.population;
  const tauxChomage = isFiltered
    ? population > 0
      ? filtered.reduce((s: number, r: any) => s + r.tauxChomage * r.population, 0) / population
      : 0
    : n.tauxChomage;

  // Croissance = toujours nationale (pas de donnée régionale)
  const croissanceDiff = n.croissance - n.croissancePrev;
  const chomageDiff = isFiltered ? 0 : n.tauxChomage - n.tauxChomagePrev;

  return [
    {
      label: isFiltered ? 'PIB (sélection)' : 'PIB national',
      value: new Intl.NumberFormat('fr-FR').format(pibTotal),
      unit: n.pibTotalUnit,
      variation: isFiltered
        ? `${filtered.length} région${filtered.length > 1 ? 's' : ''}`
        : `+${((n.pibTotal / 17000 - 1) * 100).toFixed(1)}% vs 2024`,
      variationDirection: 'up' as const,
      icon: '💰',
      color: 'amber' as const,
    },
    {
      label: 'Croissance',
      value: `${n.croissance}%`,
      variation: `${croissanceDiff >= 0 ? '+' : ''}${croissanceDiff.toFixed(1)} pts`,
      variationDirection: croissanceDiff >= 0 ? ('up' as const) : ('down' as const),
      icon: '📈',
      color: 'green' as const,
    },
    {
      label: isFiltered ? 'Chômage (moy.)' : 'Taux de chômage',
      value: `${isFiltered ? tauxChomage.toFixed(1) : n.tauxChomage}%`,
      variation: isFiltered
        ? 'Moyenne pondérée'
        : `${chomageDiff >= 0 ? '+' : ''}${chomageDiff.toFixed(1)} pts`,
      variationDirection: isFiltered
        ? undefined
        : chomageDiff <= 0
          ? ('up' as const)
          : ('down' as const),
      icon: '📊',
      color: 'purple' as const,
    },
    {
      label: isFiltered ? 'Population (sél.)' : 'Population',
      value: new Intl.NumberFormat('fr-FR', {
        notation: 'compact',
        compactDisplay: 'long',
      }).format(population),
      icon: '👥',
      color: 'blue' as const,
    },
  ];
});

// ─── Top régions (classement PIB/hab) ───────────────────────────────
const rankedRegions = computed(() =>
  [...filteredRegions.value].sort((a: any, b: any) => b.pibParHabitant - a.pibParHabitant),
);
const maxPibRank = computed(() =>
  rankedRegions.value.length ? rankedRegions.value[0].pibParHabitant : 1,
);

// ─── Config carte embarquée (choropleth PIB simplifié) ──────────────
const mapConfig = computed<SenegalMapConfig>(() => ({
  title: '',
  theme: 'dark',
  center: [-14.4524, 14.4974],
  zoom: 6.5,
  interactionMode: 'flat',
  datasets: [
    {
      id: 'pib-region',
      label: 'PIB par région',
      type: 'choropleth',
      visible: true,
      data: filteredRegions.value.map((r: any) => ({
        regionCode: r.regionCode,
        region: r.region,
        pibParHabitant: r.pibParHabitant,
        tauxChomage: r.tauxChomage,
        population: r.population,
        secteurDominant: r.secteurDominant,
      })),
      joinField: 'regionCode',
      geoJoinField: 'code',
      getValue: (d: any) => d.pibParHabitant,
      colorScale: {
        type: 'gradient' as const,
        stops: [
          { value: 0, color: [255, 235, 235, 180] as RGBAColor, label: '< 200k' },
          { value: 300000, color: [255, 200, 80, 200] as RGBAColor, label: '300k' },
          { value: 600000, color: [34, 197, 94, 200] as RGBAColor, label: '600k' },
          { value: 1000000, color: [0, 80, 0, 220] as RGBAColor, label: '> 1M FCFA' },
        ],
        fallback: [80, 80, 80, 100] as RGBAColor,
      },
      pickable: true,
      popup: {
        title: (d: any) => d.region,
        fields: [
          { key: 'region', label: 'Région', format: 'text' as const },
          {
            key: 'pibParHabitant',
            label: 'PIB/hab',
            format: 'currency' as const,
            suffix: ' FCFA',
          },
          { key: 'tauxChomage', label: 'Chômage', format: 'percent' as const, suffix: '%' },
          { key: 'population', label: 'Population', format: 'number' as const },
          { key: 'secteurDominant', label: 'Secteur', format: 'text' as const },
        ],
      },
    },
  ],
  legend: {
    title: 'PIB/hab (FCFA)',
    type: 'gradient',
    colorScale: {
      type: 'gradient' as const,
      stops: [
        { value: 0, color: [255, 235, 235, 180] as RGBAColor, label: 'Faible' },
        { value: 500000, color: [255, 200, 80, 200] as RGBAColor, label: 'Moyen' },
        { value: 1000000, color: [0, 80, 0, 220] as RGBAColor, label: 'Élevé' },
      ],
      fallback: [80, 80, 80, 100] as RGBAColor,
    },
    position: 'bottom-left',
  },
  controls: {
    zoom: true,
    themeToggle: true,
    export: true,
  },
}));

// ─── Config carte transferts diaspora (arcs monde → Sénégal) ────────
const maxTransfert = computed(() => {
  const data = diaspora.value;
  if (!data.length) return 1;
  return Math.max(...data.map((d: any) => d.montant));
});

const totalTransferts = computed(() =>
  diaspora.value.reduce((s: number, d: any) => s + d.montant, 0),
);

const diasporaMapConfig = computed<SenegalMapConfig>(() => ({
  title: '',
  theme: 'dark',
  center: [-5, 25],
  zoom: 2.5,
  interactionMode: 'flat',
  datasets: [
    {
      id: 'transferts-diaspora',
      label: 'Transferts diaspora',
      type: 'arc',
      visible: true,
      data: diaspora.value,
      getSourcePosition: (d: any) => [d.origineLng, d.origineLat],
      getTargetPosition: (d: any) => [d.destLng, d.destLat],
      getSourceColor: () => [0, 210, 255, 200] as RGBAColor,
      getTargetColor: () => [255, 160, 50, 220] as RGBAColor,
      getWidth: (d: any) => 1 + (d.montant / maxTransfert.value) * 8,
      pickable: true,
      popup: {
        title: (d: any) => `${d.pays} → ${d.destination}`,
        fields: [
          { key: 'pays', label: 'Pays d\u2019accueil', format: 'text' as const },
          { key: 'destination', label: 'Destination', format: 'text' as const },
          { key: 'montant', label: 'Transferts', format: 'number' as const, suffix: ' Mds FCFA' },
          {
            key: 'diaspora',
            label: 'Diaspora estim.',
            format: 'number' as const,
            suffix: ' pers.',
          },
        ],
      },
    },
  ],
  controls: {
    zoom: true,
    themeToggle: true,
    export: true,
  },
}));

// ─── Config carte alertes migratoires (scatterplot) ─────────────────
const totalVictimes = computed(() =>
  alertesMigration.value.reduce((s: number, d: any) => s + d.victimes, 0),
);

const alerteTypeColors: Record<string, RGBAColor> = {
  Naufrage: [239, 68, 68, 220],
  Détention: [249, 115, 22, 200],
  Disparition: [168, 85, 247, 200],
  Violence: [239, 68, 68, 180],
  Expulsion: [234, 179, 8, 200],
  Interception: [59, 130, 246, 180],
  Arrivée: [34, 197, 94, 180],
  Départ: [255, 255, 255, 160],
  'Point de transit': [156, 163, 175, 180],
};

const alertesMapConfig = computed<SenegalMapConfig>(() => ({
  title: '',
  theme: 'dark',
  center: [-5, 25],
  zoom: 2.8,
  interactionMode: 'flat',
  datasets: [
    {
      id: 'alertes-migration',
      label: 'Alertes migratoires',
      type: 'scatterplot',
      visible: true,
      data: alertesMigration.value,
      getPosition: (d: any) => [d.lng, d.lat],
      getRadius: (d: any) => (d.victimes > 0 ? 3000 + d.victimes * 800 : 2500),
      getColor: (d: any) => alerteTypeColors[d.type] ?? [239, 68, 68, 200],
      radiusMinPixels: 4,
      radiusMaxPixels: 22,
      pickable: true,
      popup: {
        title: (d: any) => d.lieu,
        fields: [
          { key: 'type', label: 'Type', format: 'badge' as const },
          { key: 'date', label: 'Date', format: 'text' as const },
          { key: 'victimes', label: 'Victimes', format: 'number' as const },
          { key: 'detail', label: 'Détail', format: 'text' as const },
        ],
      },
    },
  ],
  legend: {
    title: 'Type d\u2019incident',
    type: 'items',
    items: [
      { label: 'Naufrage', color: 'rgb(239,68,68)' },
      { label: 'Détention', color: 'rgb(249,115,22)' },
      { label: 'Disparition', color: 'rgb(168,85,247)' },
      { label: 'Interception', color: 'rgb(59,130,246)' },
      { label: 'Départ', color: 'rgb(255,255,255)' },
    ],
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
  <div class="min-h-screen bg-gray-50 pb-6 dark:bg-gray-950">
    <div class="w-full px-3 py-3 sm:px-5 sm:py-5 lg:px-6">
      <AppBreadcrumb :items="[{ label: 'Dashboard' }, { label: 'Économie' }]" />

      <!-- Hero -->
      <header class="mb-4">
        <div class="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1
              class="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-xl lg:text-2xl"
            >
              Dashboard Économique
              <span
                class="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent"
              >
                Sénégal
              </span>
            </h1>
            <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-500 sm:text-sm">
              Panorama des indicateurs macroéconomiques et données régionales 2020–2025
            </p>
          </div>
          <div
            v-if="lastUpdated"
            class="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] text-gray-500 dark:border-gray-800 dark:bg-gray-900"
          >
            <span class="h-1 w-1 animate-pulse rounded-full bg-emerald-500" />
            MAJ : {{ lastUpdated }}
          </div>
        </div>
      </header>

      <!-- Filtres -->
      <section v-if="isReady" class="mb-3">
        <DashboardFilters
          :sectors="availableSectors"
          :regions="regionOptions"
          v-model:active-sectors="activeSectors"
          v-model:active-tendances="activeTendances"
          v-model:active-regions="activeRegions"
          :filtered-count="filteredRegions.length"
          @reset="resetFilters"
        />
      </section>

      <!-- KPI Cards -->
      <section v-if="kpis.length" class="mb-3 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        <DashboardKpiCard v-for="kpi in kpis" :key="kpi.label" v-bind="kpi" />
      </section>

      <!-- Carte + Classement côte à côte -->
      <section class="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-5">
        <!-- Carte choroplèthe -->
        <div
          class="dashboard-map relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700/50 dark:bg-gray-900/80 lg:col-span-3"
          style="height: 340px"
        >
          <ClientOnly>
            <MapSenegalMap :config="mapConfig" />
            <template #fallback>
              <div class="flex h-full items-center justify-center">
                <div class="text-center">
                  <div
                    class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"
                  />
                  <p class="text-xs text-gray-500">Chargement de la carte…</p>
                </div>
              </div>
            </template>
          </ClientOnly>
        </div>

        <!-- Classement régions (toutes les 14) -->
        <div
          class="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700/50 dark:bg-gray-900/80 lg:col-span-2"
        >
          <h3
            class="mb-2 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300"
          >
            Classement PIB / habitant
          </h3>
          <div class="space-y-1.5 overflow-y-auto" style="max-height: 290px">
            <div
              v-for="(r, idx) in rankedRegions"
              :key="r.regionCode"
              class="flex items-center gap-2"
            >
              <span
                class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[9px] font-black"
                :class="
                  idx === 0
                    ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400'
                    : idx === 1
                      ? 'bg-gray-400/20 text-gray-500 dark:text-gray-300'
                      : idx === 2
                        ? 'bg-amber-700/20 text-amber-700 dark:text-amber-600'
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-600'
                "
              >
                {{ idx + 1 }}
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between">
                  <span
                    class="truncate text-[11px] font-semibold text-gray-800 dark:text-gray-200"
                    >{{ r.region }}</span
                  >
                  <span
                    class="ml-2 whitespace-nowrap text-[10px] tabular-nums text-gray-500 dark:text-gray-500"
                  >
                    {{ new Intl.NumberFormat('fr-FR').format(r.pibParHabitant) }}
                    <span class="text-gray-400 dark:text-gray-700">F</span>
                  </span>
                </div>
                <div
                  class="mt-0.5 h-0.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
                >
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    :class="idx < 3 ? 'bg-amber-500/60' : 'bg-sky-600/40'"
                    :style="{ width: `${(r.pibParHabitant / maxPibRank) * 100}%` }"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Graphiques côte à côte -->
      <section class="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div v-if="evolution.length">
          <ClientOnly>
            <DashboardLineChart :data="evolution" />
            <template #fallback>
              <div class="h-80 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-900/50" />
            </template>
          </ClientOnly>
        </div>
        <div v-if="filteredRegions.length">
          <ClientOnly>
            <DashboardBarChart :data="filteredRegions" />
            <template #fallback>
              <div class="h-96 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-900/50" />
            </template>
          </ClientOnly>
        </div>
      </section>

      <!-- Carte transferts diaspora -->
      <section v-if="diaspora.length" class="mb-3">
        <div
          class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700/50 dark:bg-gray-900/80"
        >
          <div
            class="flex items-center justify-between border-b border-gray-200 px-4 py-2.5 dark:border-gray-700/50"
          >
            <div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white">
                Transferts de la diaspora sénégalaise
              </h3>
              <p class="mt-0.5 text-[11px] text-gray-500">
                Flux financiers estimés par pays d'accueil —
                <span class="font-semibold text-amber-500"
                  >{{ new Intl.NumberFormat('fr-FR').format(totalTransferts) }} Mds FCFA/an</span
                >
              </p>
            </div>
          </div>
          <div class="dashboard-map relative" style="height: 420px">
            <ClientOnly>
              <MapSenegalMap :config="diasporaMapConfig" />
              <template #fallback>
                <div class="flex h-full items-center justify-center">
                  <div class="text-center">
                    <div
                      class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"
                    />
                    <p class="text-xs text-gray-500">Chargement de la carte…</p>
                  </div>
                </div>
              </template>
            </ClientOnly>
          </div>
        </div>
      </section>

      <!-- Carte alertes migratoires -->
      <section v-if="alertesMigration.length" class="mb-3">
        <div
          class="overflow-hidden rounded-xl border border-red-200/50 bg-white dark:border-red-900/30 dark:bg-gray-900/80"
        >
          <div
            class="flex items-center justify-between border-b border-red-200/50 bg-red-50/50 px-4 py-2.5 dark:border-red-900/30 dark:bg-red-950/20"
          >
            <div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white">
                Alertes migratoires — Sénégalais en danger
              </h3>
              <p class="mt-0.5 text-[11px] text-gray-500">
                Incidents sur les routes migratoires (2025) —
                <span class="font-semibold text-red-500"
                  >{{ totalVictimes }} victimes recensées</span
                >
              </p>
            </div>
          </div>
          <div class="dashboard-map relative" style="height: 420px">
            <ClientOnly>
              <MapSenegalMap :config="alertesMapConfig" />
              <template #fallback>
                <div class="flex h-full items-center justify-center">
                  <div class="text-center">
                    <div
                      class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent"
                    />
                    <p class="text-xs text-gray-500">Chargement de la carte…</p>
                  </div>
                </div>
              </template>
            </ClientOnly>
          </div>
        </div>
      </section>

      <!-- Tableau données régionales + Gauge -->
      <section v-if="filteredRegions.length" class="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-5">
        <div class="lg:col-span-4">
          <DashboardRegionTable :regions="filteredRegions" />
        </div>
        <div class="lg:col-span-1">
          <DashboardGauge
            :metrics="gaugeMetrics"
            :region-count="filteredRegions.length"
            :total-regions="regions.length"
          />
        </div>
      </section>

      <!-- Sources & crédits -->
      <footer
        class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-gray-800/50 dark:bg-gray-900/40"
      >
        <h4
          class="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600"
        >
          Sources & méthodologie
        </h4>
        <ul class="space-y-1 text-xs text-gray-500 dark:text-gray-600">
          <li v-for="source in sources" :key="source">{{ source }}</li>
        </ul>
        <p class="mt-2 text-[10px] italic text-gray-400 dark:text-gray-700">
          Données de démonstration. Dernière mise à jour : {{ lastUpdated }}.
        </p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Force la carte embarquée à remplir son parent au lieu de 100vh */
.dashboard-map :deep(.senegal-map) {
  height: 100% !important;
}
</style>
