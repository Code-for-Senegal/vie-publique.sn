<script setup lang="ts">
import type { EtatOrganisationOverview } from '~~/types/etat-organisation';

// Endpoint léger (mis en cache côté serveur) : le décret en vigueur + les
// compteurs par type, désormais calculés sur le snapshot du décret actif
// (même logique que EtatOrganisationStatsGrid). Évite le fetch lourd des entités.
const { data: overview } = await useAsyncData<EtatOrganisationOverview>(
  'home-etat-organisation-overview',
  () => $fetch('/api/etat-organisation/overview'),
  { server: true },
);

const formatDate = (v?: string) =>
  v
    ? new Date(v).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

// Même configuration visuelle que EtatOrganisationStatsGrid (page cible)
const STAT_TYPES = [
  'ministere',
  'etablissement_public',
  'societe_nationale',
  'societe_participation_publique',
];
const TYPE_ICONS: Record<string, string> = {
  ministere: 'i-heroicons-building-office',
  etablissement_public: 'i-heroicons-academic-cap',
  societe_nationale: 'i-heroicons-building-storefront',
  societe_participation_publique: 'i-heroicons-building-storefront',
};
const TYPE_COLORS: Record<string, string> = {
  ministere: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  etablissement_public: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  societe_nationale: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  societe_participation_publique:
    'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
};
const PLURAL_LABELS: Record<string, string> = {
  ministere: 'Ministères',
  etablissement_public: 'Établissements publics',
  societe_nationale: 'Sociétés nationales',
  societe_participation_publique: 'Sociétés à participation publique',
};

const stats = computed(() => {
  const types = overview.value?.stats?.types ?? [];
  const byCode = new Map(types.map((t) => [t.code, t]));
  return STAT_TYPES.filter((code) => byCode.has(code)).map((code) => ({
    code,
    label: PLURAL_LABELS[code] || byCode.get(code)!.label,
    count: byCode.get(code)!.count,
    icon: TYPE_ICONS[code] || 'i-heroicons-building-office',
    color: TYPE_COLORS[code] || 'bg-gray-100 text-gray-500',
  }));
});

const decree = computed(() => overview.value?.decree ?? null);
const totalEntities = computed(() => overview.value?.stats?.total_entities ?? 0);
</script>

<template>
  <section v-if="stats.length" class="my-4" aria-labelledby="etat-organisation-heading">
    <h2
      id="etat-organisation-heading"
      class="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-white"
    >
      Organisation de l'État
    </h2>

    <UCard
      class="overflow-hidden border-0 bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800"
      :ui="{ body: { padding: 'p-4 sm:p-6' } }"
    >
      <!-- Décret en vigueur -->
      <p class="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <template v-if="decree">
          Décret n° {{ decree.numero }} de répartition des services de l'État<template
            v-if="decree.date_publication"
            >, en vigueur depuis le {{ formatDate(decree.date_publication) }}</template
          >.
        </template>
        <span class="mx-1 hidden text-gray-300 dark:text-gray-600 sm:inline">|</span>
        <span class="font-semibold text-gray-900 dark:text-white">{{ totalEntities }}</span>
        entités publiques recensées
      </p>

      <!-- Stats par type (aperçu de EtatOrganisationStatsGrid) -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          v-for="stat in stats"
          :key="stat.code"
          class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
        >
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            :class="stat.color"
          >
            <UIcon :name="stat.icon" class="h-5 w-5" />
          </span>
          <div class="min-w-0">
            <p class="text-lg font-bold leading-none text-gray-900 dark:text-white">
              {{ stat.count }}
            </p>
            <p class="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </UCard>

    <!-- CTA -->
    <div class="mt-6 text-center">
      <UButton
        to="/etat-senegal/organisation"
        color="gray"
        variant="solid"
        size="md"
        trailing-icon="i-heroicons-arrow-right"
        class="rounded-full border-gray-200 bg-white font-medium"
      >
        Explorer l'organigramme de l'État
      </UButton>
    </div>
  </section>
</template>
