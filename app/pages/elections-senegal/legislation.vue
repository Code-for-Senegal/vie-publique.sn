<script setup lang="ts">
import { useElectoralDashboard } from '~/composables/elections/dashboard/useElectoralDashboard';

const route = useRoute();
const router = useRouter();

const selectedType = ref<string>((route.query.type as string) || 'all');
const selectedYear = ref<string>((route.query.year as string) || 'all');

const { config } = useElectoralDashboard();

const currentPage = ref(parseInt((route.query.page as string) || '1'));
const searchQuery = ref((route.query.q as string) || '');
const sortBy = ref((route.query.sort as string) || '-publish_date');

const selectedElectionId = computed(() => {
  if (selectedType.value === 'all' && selectedYear.value === 'all') return null;
  if (!config.value?.elections) return null;

  const matchingElection = config.value.elections.find(e => {
    if (selectedType.value !== 'all' && e.type !== selectedType.value) return false;
    if (selectedYear.value !== 'all' && e.year !== parseInt(selectedYear.value)) return false;
    return true;
  });

  return matchingElection?.id || null;
});

const { items: documents, loading, pagination, error } = useCmsCollection({
  collection: 'documents',
  filters: computed(() => {
    const filters: any = {};
    if (selectedElectionId.value) {
      filters.election_id = selectedElectionId.value;
    }
    return filters;
  }),
  search: searchQuery,
  sort: sortBy,
  page: currentPage,
  limit: 12
});

const itemsPerPage = 12;
const totalItems = computed(() => pagination.value?.total || 0);
const totalPages = computed(() => pagination.value?.totalPages || 1);

const setSearchQuery = (q: string) => {
  searchQuery.value = q;
  currentPage.value = 1;
  router.replace({ query: { ...route.query, q: q || undefined, page: '1' } });
};

const searchQueryUI = computed({
  get: () => searchQuery.value,
  set: (val) => setSearchQuery(val)
});

watch(currentPage, (newPage) => {
  router.replace({ query: { ...route.query, page: newPage.toString() } });
});

watch(sortBy, (newSort) => {
  currentPage.value = 1;
  router.replace({ query: { ...route.query, sort: newSort, page: '1' } });
});

watch([selectedType, selectedYear], () => {
  currentPage.value = 1;
  router.replace({
    query: {
      ...route.query,
      type: selectedType.value === 'all' ? undefined : selectedType.value,
      year: selectedYear.value === 'all' ? undefined : selectedYear.value,
      page: '1'
    }
  });
});

const typeOptions = computed(() => {
  if (!config.value?.elections) return [{ label: 'Tous les types', value: 'all' }];

  const electionsWithDocsIds = new Set(
    config.value?.election_ids_with_documents || []
  );

  const typesWithDocs = new Set(
    config.value.elections
      .filter(e => electionsWithDocsIds.has(e.id))
      .map(e => e.type)
  );

  const typeLabels: Record<string, string> = {
    'presidential': 'Présidentielle',
    'legislative': 'Législatives',
    'locale': 'Locales'
  };

  const options = Array.from(typesWithDocs).map(type => ({
    label: typeLabels[type] || type,
    value: type
  }));

  return [{ label: 'Tous les types', value: 'all' }, ...options];
});

const yearOptions = computed(() => {
  if (!config.value?.elections) return [{ label: 'Toutes les années', value: 'all' }];

  const electionsWithDocsIds = new Set(
    config.value?.election_ids_with_documents || []
  );

  const yearsWithDocs = new Set(
    config.value.elections
      .filter(e => {
        if (!electionsWithDocsIds.has(e.id)) return false;
        if (selectedType.value !== 'all' && e.type !== selectedType.value) return false;
        return true;
      })
      .map(e => e.year)
  );

  const options = Array.from(yearsWithDocs)
    .sort((a, b) => b - a)
    .map(year => ({
      label: year.toString(),
      value: year.toString()
    }));

  return [{ label: 'Toutes les années', value: 'all' }, ...options];
});

const sortOptions = [
  { label: 'Plus récent', value: '-publish_date' },
  { label: 'Plus ancien', value: 'publish_date' },
  { label: 'Titre A-Z', value: 'title' },
];

useHead({
  title: 'Législation Électorale | Sénégal',
  meta: [
    { name: 'description', content: 'Consultez les textes de loi, décrets et documents officiels régissant les élections au Sénégal.' }
  ]
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-gray-950 pb-20">
    <!-- Header Compact -->
    <div class="bg-white dark:bg-gray-900 border-b dark:border-gray-800 pt-8 pb-6 shadow-sm">
      <div class="container mx-auto px-4 max-w-6xl">
        <!-- Breadcrumb -->
        <nav class="mb-6">
          <NuxtLink to="/elections-senegal" class="inline-flex items-center text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors">
            <UIcon name="i-heroicons-arrow-left" class="mr-2 h-4 w-4" /> Retour Élections
          </NuxtLink>
        </nav>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-1">
            <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Législation Électorale</h1>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-wider italic">Textes de lois, décrets et arrêtés officiels</p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <USelect
              v-model="selectedType"
              :options="typeOptions"
              size="md"
              class="w-full md:w-48"
              placeholder="Type d'élection"
            />
            <USelect
              v-model="selectedYear"
              :options="yearOptions"
              size="md"
              class="w-full md:w-32"
              placeholder="Année"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 max-w-6xl py-10">
      <!-- Search & Sort -->
      <div class="mb-10 flex flex-col md:flex-row gap-4 items-center">
        <div class="relative flex-1 w-full">
           <UInput
            v-model="searchQueryUI"
            icon="i-heroicons-magnifying-glass"
            placeholder="Rechercher un décret, une loi..."
            size="lg"
            class="w-full"
            :ui="{ rounded: 'rounded-xl' }"
          />
        </div>
        <USelectMenu v-model="sortBy" :options="sortOptions" value-attribute="value" size="lg" class="w-full md:w-48" />
      </div>

      <!-- Results Grid -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard v-for="n in 6" :key="n" class="animate-pulse rounded-2xl border dark:border-gray-800">
           <div class="h-32 bg-slate-100 dark:bg-gray-800 rounded-xl"></div>
        </UCard>
      </div>

      <div v-else-if="documents.length === 0" class="text-center py-32 bg-white dark:bg-gray-900 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
         <UIcon name="i-heroicons-document-magnifying-glass" class="h-16 w-16 text-gray-200 mx-auto mb-6" />
         <h3 class="text-xl font-black text-gray-400 uppercase italic">Aucun document trouvé</h3>
         <p class="text-gray-500 mt-2 italic text-sm">Essayez de modifier vos filtres ou votre recherche.</p>
         <UButton
           v-if="selectedType !== 'all' || selectedYear !== 'all'"
           @click="selectedType = 'all'; selectedYear = 'all'"
           variant="soft"
           class="mt-6 rounded-full"
         >
           Voir tout
         </UButton>
      </div>

      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UCard
            v-for="doc in documents"
            :key="doc.id"
            class="group hover:shadow-xl transition-all duration-300 rounded-2xl border dark:border-gray-800 overflow-hidden flex flex-col"
            :ui="{ body: { padding: 'p-0' } }"
          >
            <NuxtLink :to="`/documents/${doc.id}/${doc.slug}`" class="flex flex-col h-full">
              <div class="p-5 flex-1 space-y-3">
                <div class="flex items-start justify-between">
                  <div class="p-2 bg-primary-50 dark:bg-primary-900/10 rounded-lg">
                    <UIcon name="i-heroicons-document-text" class="h-5 w-5 text-primary-600" />
                  </div>
                  <UBadge v-if="doc.publish_date" color="gray" variant="soft" class="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full">
                    {{ new Date(doc.publish_date).toLocaleDateString('fr-FR', { year: 'numeric' }) }}
                  </UBadge>
                </div>

                <h3 class="text-sm font-black text-gray-900 dark:text-white leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary-600 transition-colors uppercase">
                  {{ doc.title }}
                </h3>

                <p class="text-[11px] text-gray-500 line-clamp-3 leading-relaxed">
                  {{ (doc as any).description || 'Aucune description disponible pour ce document.' }}
                </p>
              </div>

              <div class="px-5 py-3 border-t dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30 flex items-center justify-between">
                <span class="text-[10px] font-black uppercase text-gray-400">PDF • Officiel</span>
                <UIcon name="i-heroicons-arrow-down-tray" class="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
              </div>
            </NuxtLink>
          </UCard>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-12 flex justify-center">
          <UPagination
            v-model="currentPage"
            :total="totalItems"
            :page-count="itemsPerPage"
            :ui="{ rounded: 'rounded-full' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
