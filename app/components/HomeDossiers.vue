<script setup lang="ts">
import type { DossierListItem } from '~~/types/dossier';

// La section n'apparaît que si la feature est activée
const { isFeatureEnabled } = useFeatureFlags();
const enabled = computed(() => isFeatureEnabled('menu_dossiers'));

const { data, pending, error } = useFetch('/api/dossiers', {
  key: 'home-dossiers',
  query: { limit: 3, sortBy: '-publish_date' },
  lazy: true,
});

// L'API renvoie { items: [...] } en succès (la clé `dossiers` n'existe que dans
// le fallback d'erreur du handler) → lire `items`.
const dossiers = computed<DossierListItem[]>(() => (data.value?.items as DossierListItem[]) || []);
</script>

<template>
  <section v-if="enabled" class="my-4" aria-labelledby="dossiers-heading">
    <h2
      id="dossiers-heading"
      class="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-white"
    >
      Dossiers thématiques
    </h2>

    <!-- Loading state -->
    <div
      v-if="pending"
      class="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-4 pt-1 md:grid md:grid-cols-3 md:gap-4 md:overflow-x-visible md:px-0 md:pb-0 md:pt-0"
      aria-busy="true"
    >
      <div v-for="n in 3" :key="n" class="w-64 flex-shrink-0 snap-start md:w-auto md:flex-shrink">
        <USkeleton class="aspect-video w-full rounded-t-2xl" />
        <div
          class="space-y-2 rounded-b-2xl bg-white p-4 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
        >
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-3 w-2/3" />
        </div>
      </div>
    </div>

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      title="Erreur"
      description="Une erreur est survenue lors du chargement des dossiers."
      color="red"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Content -->
    <div v-else-if="dossiers.length > 0">
      <div
        class="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-4 pt-1 md:grid md:grid-cols-3 md:gap-4 md:overflow-x-visible md:px-0 md:pb-0 md:pt-0"
        role="list"
      >
        <div
          v-for="dossier in dossiers"
          :key="dossier.id"
          role="listitem"
          class="w-64 flex-shrink-0 snap-start md:w-auto md:flex-shrink"
        >
          <DossierCard :dossier="dossier" />
        </div>
      </div>

      <!-- CTA -->
      <div class="mt-5 text-center">
        <UButton
          to="/dossiers"
          color="gray"
          variant="solid"
          size="md"
          trailing-icon="i-heroicons-arrow-right"
          class="rounded-full border-gray-200 bg-white font-medium"
        >
          Voir tous les dossiers
        </UButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
