<script setup lang="ts">
import { useElectionMapDataResult } from '~/composables/useElectionMapJsonResult';

interface Props {
  electionType: string;
  electionYear: number;
}

const props = defineProps<Props>();

const { getTableDataResult, loading } = useElectionMapDataResult();

const { data: tableData, pending, refresh } = await useAsyncData(
  `table-results-${props.electionType}-${props.electionYear}`,
  () => getTableDataResult(props.electionType, props.electionYear),
  {
    watch: [() => props.electionType, () => props.electionYear]
  }
);

// Sort logic
const sortConfig = ref({
  field: 'commune' as 'commune' | 'coalition' | 'votes',
  direction: 'asc' as 'asc' | 'desc'
});

const searchQuery = ref("");

const filteredData = computed(() => {
  if (!tableData.value) return [];
  if (!searchQuery.value) return tableData.value;
  
  const query = searchQuery.value.toLowerCase().trim();
  return tableData.value.filter(item => 
    item.commune.toLowerCase().includes(query) ||
    item.coalition.toLowerCase().includes(query) ||
    item.headOfList.toLowerCase().includes(query)
  );
});

const sortedData = computed(() => {
  const data = [...filteredData.value];
  return data.sort((a, b) => {
    let valA = a[sortConfig.value.field];
    let valB = b[sortConfig.value.field];
    
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    
    const multiplier = sortConfig.value.direction === 'asc' ? 1 : -1;
    if (valA < valB) return -1 * multiplier;
    if (valA > valB) return 1 * multiplier;
    return 0;
  });
});

const toggleSort = (field: 'commune' | 'coalition' | 'votes') => {
  if (sortConfig.value.field === field) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sortConfig.value.field = field;
    sortConfig.value.direction = field === 'votes' ? 'desc' : 'asc';
  }
};

const getSortIcon = (field: string) => {
  if (sortConfig.value.field !== field) return 'i-heroicons-arrows-up-down';
  return sortConfig.value.direction === 'asc' ? 'i-heroicons-arrow-up' : 'i-heroicons-arrow-down';
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('fr-FR').format(num);
};
</script>

<template>
  <div class="relative flex flex-col h-full gap-4">
    <!-- Search Bar -->
    <div class="flex items-center justify-between gap-4">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="Rechercher une commune, coalition..."
        class="w-full sm:max-w-md shadow-sm"
        size="md"
        :ui="{ rounded: 'rounded-xl', padding: { md: 'px-4 py-2.5' } }"
      />
      
      <div v-if="sortedData.length > 0" class="hidden sm:block">
        <UBadge color="gray" variant="subtle" class="rounded-full px-3 py-1">
          {{ sortedData.length === 1 ? `${sortedData.length} commune trouvée` : `${sortedData.length} communes trouvées` }}
        </UBadge>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending || loading" class="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-800">
      <div class="relative">
        <div class="h-12 w-12 rounded-full border-4 border-primary-500/20 border-t-primary-600 animate-spin"></div>
        <div class="absolute inset-0 flex items-center justify-center">
            <div class="h-2 w-2 bg-primary-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p class="mt-4 text-sm font-medium text-gray-500 animate-pulse">Chargement des résultats locaux...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!sortedData.length" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
      <UIcon name="i-heroicons-table-cells" class="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
      <h3 class="text-lg font-bold text-gray-500">Aucun résultat trouvé</h3>
      <p class="text-sm text-gray-400">Aucune donnée n'est disponible pour cette sélection.</p>
    </div>

    <!-- Table Container -->
    <div v-else class="flex-1 overflow-hidden border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 shadow-sm">
      <div class="relative overflow-x-auto overflow-y-auto max-h-[calc(100vh-350px)] sm:max-h-[600px] scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
        <table class="w-full text-left border-collapse">
          <!-- Sticky Header -->
          <thead class="sticky top-0 z-10 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th scope="col" class="px-3 py-3 sm:p-4 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                <button @click="toggleSort('commune')" class="flex items-center gap-1 hover:text-primary-600 transition-colors uppercase">
                  Commune
                  <UIcon :name="getSortIcon('commune')" class="h-3.5 w-3.5" />
                </button>
              </th>
              <th scope="col" class="px-3 py-3 sm:p-4 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                <button @click="toggleSort('coalition')" class="flex items-center gap-1 hover:text-primary-600 transition-colors uppercase">
                  Coalition Gagnante
                  <UIcon :name="getSortIcon('coalition')" class="h-3.5 w-3.5" />
                </button>
              </th>
              <th scope="col" class="px-3 py-3 sm:p-4 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 text-right">
                <button @click="toggleSort('votes')" class="flex items-center justify-end gap-1 hover:text-primary-600 transition-colors w-full uppercase">
                  Voix
                  <UIcon :name="getSortIcon('votes')" class="h-3.5 w-3.5" />
                </button>
              </th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="item in sortedData" :key="item.id" class="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30">
              <!-- Commune -->
              <td class="px-3 py-3 sm:p-4">
                <span class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">{{ item.commune }}</span>
              </td>

              <!-- Coalition + Tête de liste -->
              <td class="px-3 py-3 sm:p-4">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <div class="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(var(--color-primary-500),0.4)]"></div>
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-2">{{ item.coalition }}</span>
                  </div>
                  <div class="flex items-center gap-2 pl-3.5">
                    <UIcon name="i-heroicons-user" class="w-3 h-3 flex-shrink-0 text-gray-400" />
                    <span class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{{ item.headOfList }}</span>
                  </div>
                </div>
              </td>

              <!-- Votes -->
              <td class="px-3 py-3 sm:p-4 text-right">
                <span class="text-sm font-black text-gray-900 dark:text-white">{{ formatNumber(item.votes) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for a more premium look */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  border-radius: 10px;
}
</style>
