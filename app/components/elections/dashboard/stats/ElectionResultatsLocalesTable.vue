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
  <div class="flex flex-col gap-3">
    <!-- Search Bar -->
    <div class="flex items-center gap-3">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="Rechercher une commune, coalition..."
        class="flex-1"
        size="sm"
        :ui="{ rounded: 'rounded-xl', padding: { sm: 'px-3 py-2' } }"
      />
      <UBadge v-if="sortedData.length > 0" color="gray" variant="subtle" class="rounded-full px-2.5 py-1 text-[10px] shrink-0">
        {{ sortedData.length }}
      </UBadge>
    </div>

    <!-- Sort controls -->
    <div class="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 px-1">
      <button class="flex items-center gap-1 hover:text-primary-600 transition-colors" @click="toggleSort('commune')">
        Commune
        <UIcon :name="getSortIcon('commune')" class="h-3 w-3" />
      </button>
      <button class="flex items-center gap-1 hover:text-primary-600 transition-colors" @click="toggleSort('coalition')">
        Coalition
        <UIcon :name="getSortIcon('coalition')" class="h-3 w-3" />
      </button>
      <button class="flex items-center gap-1 hover:text-primary-600 transition-colors ml-auto" @click="toggleSort('votes')">
        Voix
        <UIcon :name="getSortIcon('votes')" class="h-3 w-3" />
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="pending || loading" class="flex flex-col items-center justify-center py-20">
      <div class="h-10 w-10 rounded-full border-4 border-primary-500/20 border-t-primary-600 animate-spin"></div>
      <p class="mt-4 text-sm text-gray-500 animate-pulse">Chargement des résultats...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!sortedData.length" class="flex flex-col items-center justify-center py-16">
      <UIcon name="i-heroicons-table-cells" class="w-10 h-10 text-gray-300 dark:text-gray-700 mb-3" />
      <h3 class="text-base font-bold text-gray-500">Aucun résultat trouvé</h3>
      <p class="text-xs text-gray-400">Aucune donnée disponible pour cette sélection.</p>
    </div>

    <!-- Results List -->
    <div v-else class="space-y-1.5 max-h-[calc(100vh-300px)] overflow-y-auto">
      <div
        v-for="item in sortedData"
        :key="item.id"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
      >
        <!-- Commune + Coalition info -->
        <div class="min-w-0 flex-1">
          <h4 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight truncate">
            {{ item.commune }}
          </h4>
          <div class="flex items-center gap-1.5 mt-0.5">
            <div class="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500"></div>
            <span class="text-xs text-gray-600 dark:text-gray-400 truncate">{{ item.coalition }}</span>
          </div>
          <p v-if="item.headOfList" class="text-[10px] text-gray-400 truncate pl-3">
            {{ item.headOfList }}
          </p>
        </div>

        <!-- Votes -->
        <div class="shrink-0 text-right">
          <span class="text-sm font-black text-gray-900 dark:text-white tabular-nums">{{ formatNumber(item.votes) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
