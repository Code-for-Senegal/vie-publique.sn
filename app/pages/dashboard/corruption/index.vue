<script setup lang="ts">
import type { CorruptionDashboardResponse } from '~~/types/corruption';


// ─── Feature flag guard ──────────────────────────────────────────────
// const { isFeatureEnabled } = useFeatureFlags();
// if (!isFeatureEnabled('menu_dashboard_corruption')) {
//   throw showError({ statusCode: 404, statusMessage: 'Page introuvable' });
// }

// ─── SEO : noindex ───────────────────────────────────────────────────
useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }],
});

useSeoMeta({
  title: 'Dashboard Corruption & Gouvernance',
  robots: 'noindex, nofollow, noarchive',
});

// ─── Data fetching ───────────────────────────────────────────────────
const {
  data: dashboard,
  pending: loading,
  error,
  refresh,
} = await useAsyncData('dashboard-corruption', () =>
  $fetch<CorruptionDashboardResponse>('/api/dashboard/corruption'),
);

const lastUpdatedFormatted = computed(() => {
  if (!dashboard.value?.lastUpdated) return '';
  return new Date(dashboard.value.lastUpdated).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// ─── Internal navigation tabs (maquette) ─────────────────────────────
const tabs = [
  { id: 'dashboard', label: 'Tableau de bord', icon: 'i-heroicons-chart-bar' },
  {
    id: 'signaler',
    label: 'Signaler',
    icon: 'i-heroicons-megaphone',
    to: '/dashboard/corruption/signaler',
  },
  { id: 'indicateurs', label: 'Indicateurs', icon: 'i-heroicons-chart-pie' },
];

const activeTab = ref('dashboard');
const router = useRouter();

function handleTabClick(tab: (typeof tabs)[number]) {
  if (tab.to) {
    router.push(tab.to);
  } else {
    activeTab.value = tab.id;
  }
}
</script>

<template>
  <div class="min-h-screen pb-16">
    <!-- Hero Header -->
    <div class="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div class="container mx-auto px-4 py-6 sm:py-8">
        <AppBreadcrumb
          :items="[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Corruption' }]"
          class="mb-4"
        />
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Dashboard Corruption &amp; Gouvernance
            </h1>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Indicateurs de transparence et de lutte contre la corruption au Sénégal
            </p>
          </div>
          <div v-if="lastUpdatedFormatted" class="text-xs text-gray-500 dark:text-gray-400">
            Dernière mise à jour : {{ lastUpdatedFormatted }}
          </div>
        </div>
      </div>
    </div>

    <!-- Tab navigation (maquette) -->
    <div
      class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95"
    >
      <div class="container mx-auto px-4">
        <nav class="-mb-px flex gap-0.5 py-1 sm:gap-2" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="[
              'group flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-all sm:gap-2 sm:px-4 sm:py-2 sm:text-sm',
              activeTab === tab.id && !tab.to
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
            ]"
            @click="handleTabClick(tab)"
          >
            <UIcon
              :name="tab.icon"
              :class="[
                'h-3.5 w-3.5 transition-colors sm:h-4 sm:w-4',
                activeTab === tab.id && !tab.to
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300',
              ]"
            />
            <span>{{ tab.label }}</span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Main content -->
    <div class="container mx-auto px-4 py-6">
      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="relative h-12 w-12">
          <div class="absolute inset-0 animate-ping rounded-full bg-orange-200 opacity-75"></div>
          <div
            class="relative flex h-12 w-12 items-center justify-center rounded-full bg-orange-100"
          >
            <UIcon name="i-heroicons-shield-check" class="h-6 w-6 animate-pulse text-orange-600" />
          </div>
        </div>
        <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">Chargement des indicateurs...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="mx-auto max-w-md py-12">
        <div
          class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20"
        >
          <div
            class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50"
          >
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="h-6 w-6 text-red-600 dark:text-red-400"
            />
          </div>
          <h3 class="text-lg font-semibold text-red-900 dark:text-red-200">Erreur de chargement</h3>
          <p class="mt-2 text-sm text-red-700 dark:text-red-300">
            Impossible de charger les données. Veuillez réessayer.
          </p>
          <button
            class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            @click="refresh()"
          >
            Réessayer
          </button>
        </div>
      </div>

      <!-- Content — Tableau de bord -->
      <div v-if="dashboard" v-show="activeTab === 'dashboard'" class="space-y-6">

        <!-- Top Section: Grid 2/3 + 1/3 -->
        <div class="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">

          <!-- Left Column (2/3) -->
          <div class="flex flex-col gap-6 lg:col-span-8">
            <!-- Score Hero -->
            <DashboardCorruptionScoreHero
              :country="dashboard.country"
              :iiag="dashboard.iiag"
              :cpi="dashboard.cpi"
            />

            <!-- Evolution Chart -->
            <DashboardCorruptionEvolutionChart :evolution="dashboard.evolution" />
          </div>

          <!-- Right Column (1/3) -->
          <div class="lg:col-span-4">
            <!-- Radar Column - fills height -->
            <DashboardCorruptionPillarRadarChart
              :pillars="dashboard.pillars"
              :year="dashboard.iiag.year"
              class="h-full"
            />
          </div>
        </div>

        <!-- Bottom Section: Signaux (Full) + Actions (Full) -->
        <div class="space-y-6">
          <!-- Signaux d'alerte (Wide) -->
          <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
            <div class="mb-6 flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Signaux d'alerte</h3>
              <NuxtLink
                to="/dashboard/corruption/signaler"
                class="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Voir les zones faibles <UIcon name="i-heroicons-chevron-right" class="h-4 w-4" />
              </NuxtLink>
            </div>
            <DashboardCorruptionAlertSignals :alerts="dashboard.alerts" />
          </div>

          <!-- Actions Citoyennes (Separate Block) -->
          <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
            <DashboardCorruptionCitizenActions />
          </div>
        </div>

        <!-- Sources -->
        <div
          class="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
        >
          <h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Sources</h4>
          <ul class="flex flex-wrap gap-x-4 gap-y-1">
            <li
              v-for="source in dashboard.sources"
              :key="source.name"
              class="text-xs text-gray-500 dark:text-gray-400"
            >
              {{ source.name }}
            </li>
          </ul>
          <p class="mt-2 text-xs italic text-gray-400 dark:text-gray-500">
            V1 Simulation &mdash; Données indicatives inspirées des rapports publics.
          </p>
        </div>
      </div>

      <!-- Content — Indicateurs (placeholder) -->
      <div v-if="dashboard" v-show="activeTab === 'indicateurs'" class="py-12 text-center">
        <div
          class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
        >
          <UIcon name="i-heroicons-chart-pie" class="h-8 w-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Indicateurs détaillés</h3>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Cette section sera disponible dans une prochaine version.
        </p>
      </div>
    </div>
  </div>
</template>
