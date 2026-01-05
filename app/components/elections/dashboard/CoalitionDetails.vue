<script setup lang="ts">
import { useElectoralDashboardLists } from "~/composables/elections/dashboard/useElectoralDashboardLists";
import { useElectoralGrouping } from "~/composables/elections/dashboard/useElectoralGrouping";
import type { Candidate } from "~~/types/candidate";

const props = defineProps<{
  coalitionId: string;
  coalitionName?: string;
  year: number;
  type: string;
  constituencyId?: string | number | null;
}>();

const emit = defineEmits(['close']);

const isPresidential = computed(() => props.type === 'presidential');
const isLocal = computed(() => ['locale', 'locales', 'local'].includes(props.type));

const { lists, loading, error } = useElectoralDashboardLists({
  coalitionId: props.coalitionId,
  constituencyId: computed(() => props.constituencyId ? String(props.constituencyId) : null),
  year: props.year,
  type: props.type
});

const filterType = ref('national');
const searchQuery = ref('');

watch(lists, (newLists) => {
  if (isLocal.value) return;

  if (newLists && newLists.length > 0) {
    const types = newLists.map(l => l.type);
    if (!types.includes('national' as any)) {
      if (types.includes('departmental' as any)) {
        filterType.value = 'departmental';
      } else if (types.includes('diaspora' as any)) {
        filterType.value = 'diaspora';
      }
    }
  }
}, { immediate: true });

const filterOptions = computed(() => [
  { label: "Nationale", value: "national" },
  {
    label: "Départements",
    value: "departmental",
    count: lists.value?.filter(l => l.type === 'departmental' && !l.is_substitute).length
  },
  {
    label: "Diaspora",
    value: "diaspora",
    count: lists.value?.filter(l => l.type === 'diaspora' && !l.is_substitute).length
  },
]);

const { groupListsByConstituency, filterListsBySearch, filterListsByType } = useElectoralGrouping();

const groupedLists = computed(() => {
  if (!lists.value) return [];

  let baseLists = lists.value;

  if (isLocal.value) {
    return baseLists;
  }

  if (searchQuery.value) {
    baseLists = filterListsBySearch(baseLists, searchQuery.value);
  } else {
    baseLists = filterListsByType(baseLists, filterType.value);
  }

  if (filterType.value === 'national' && !searchQuery.value) {
    return baseLists;
  }

  return groupListsByConstituency(baseLists);
});

const selectedCandidate = ref<Candidate | null>(null);
const isModalOpen = ref(false);

function openCandidateModal(candidate: Candidate) {
  selectedCandidate.value = candidate;
  isModalOpen.value = true;
}
</script>

<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Header with Back Button -->
    <ElectionsDashboardPresidentialDetailsHeader
      :coalition-name="coalitionName"
      :list-count="lists.length"
      :type="type"
      :candidate="isPresidential && lists.length > 0 ? lists[0].candidates[0] : null"
      @close="emit('close')"
    />

    <!-- Filters & Search (seulement pour législatives) -->
    <div v-if="!isPresidential && !isLocal" class="flex flex-col gap-4 sticky top-[132px] z-40 bg-gray-50/90 backdrop-blur-md pb-4 dark:bg-gray-950/90">
      <ElectionsDashboardFiltersCandidateSearchBar v-model="searchQuery" />

      <ElectionsDashboardFiltersCandidateFilterTabs
        v-if="!searchQuery"
        v-model="filterType"
        :options="filterOptions"
      />
    </div>

    <!-- Info candidat présidentiel -->
    <ElectionsDashboardCandidatesPresidentialCandidateProfile
      v-if="isPresidential && lists.length > 0 && lists[0].candidates.length > 0"
      :candidate="lists[0].candidates[0]"
      :coalition-name="coalitionName"
      :coalition-id="coalitionId"
    />

    <!-- Loading State -->
    <ElectionsDashboardCandidatesCandidateLoadingSkeleton v-if="loading" />

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      color="red"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      title="Erreur de chargement"
      description="Impossible de récupérer les listes. Veuillez réessayer."
    />

    <!-- Results (seulement pour législatives et locales) -->
    <div v-else-if="!isPresidential && groupedLists.length > 0" class="space-y-6">

      <!-- Mode National (Simple) ou Recherche -->
      <template v-if="filterType === 'national' || searchQuery">
          <div v-for="list in groupedLists" :key="list.id" class="space-y-4">
            <!-- List Header -->
            <div class="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border dark:border-gray-800 shadow-sm">
              <div class="flex flex-col">
                <span class="text-sm font-medium text-primary-600 dark:text-primary-400 uppercase tracking-widest px-0">
                   {{ list.constituency?.name || 'Circonscription Nationale' }}
                </span>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                   {{ list.is_substitute ? 'Liste des Suppléants' : 'Liste des Titulaires' }}
                </h3>
              </div>
              <UBadge :color="list.is_substitute ? 'orange' : 'green'" variant="subtle" class="capitalize">
                {{ list.candidates.length }} candidats
              </UBadge>
            </div>

            <!-- Candidates Grid (Titulaires) -->
            <div v-if="!list.is_substitute" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
               <ElectionsDashboardCandidatesCandidateGridCard
                 v-for="candidate in list.candidates"
                 :key="candidate.id"
                 :candidate="candidate"
                 @select="openCandidateModal"
                />
            </div>

            <!-- Candidates List (Suppleants) -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <ElectionsDashboardCandidatesCandidateListItem
                  v-for="candidate in list.candidates"
                  :key="candidate.id"
                  :candidate="candidate"
                  @select="openCandidateModal"
                />
            </div>
          </div>
      </template>

      <!-- Mode Groupé (Accordion) pour Départemental & Diaspora -->
      <template v-else>
        <div v-for="group in groupedLists" :key="group.name" class="space-y-4">
          <div class="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-xl border border-primary-100 dark:border-primary-900/50">
            <h3 class="text-xl font-black text-primary-700 dark:text-primary-400 uppercase flex items-center gap-2">
              <UIcon name="i-heroicons-map-pin" class="h-5 w-5" />
              {{ group.name }}
            </h3>
          </div>

          <UAccordion
            :items="[
              { label: 'Liste des Titulaires', slot: 'titulaires', icon: 'i-heroicons-user-group' },
              { label: 'Liste des Suppléants', slot: 'suppleants', icon: 'i-heroicons-user-plus' }
            ]"
            :ui="{ wrapper: 'flex flex-col gap-3' }"
          >
            <template #default="{ item, open }">
              <UButton color="gray" variant="ghost" class="border dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-0">
                <template #leading>
                  <UIcon :name="item.icon" class="h-5 w-5 text-primary-500" />
                </template>
                <span class="font-bold text-gray-700 dark:text-gray-300">{{ item.label }}</span>
                <template #trailing>
                  <div class="flex items-center gap-3 ml-auto">
                    <UBadge size="xs" color="gray" variant="subtle">
                      {{ (item.slot === 'titulaires' ? group.titulaires : group.suppleants)?.candidates.length || 0 }} candidats
                    </UBadge>
                    <UIcon name="i-heroicons-chevron-right-20-solid" class="w-5 h-5 transform transition-transform duration-200" :class="[open && 'rotate-90']" />
                  </div>
                </template>
              </UButton>
            </template>

            <template #titulaires>
              <div v-if="group.titulaires" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-950 rounded-xl border dark:border-gray-800">
                <ElectionsDashboardCandidatesCandidateGridCard
                 v-for="candidate in group.titulaires.candidates"
                 :key="candidate.id"
                 :candidate="candidate"
                 @select="openCandidateModal"
                />
              </div>
            </template>

            <template #suppleants>
              <div v-if="group.suppleants" class="grid grid-cols-1 md:grid-cols-2 gap-2 p-4 bg-gray-50 dark:bg-gray-950 rounded-xl border dark:border-gray-800">
                <ElectionsDashboardCandidatesCandidateListItem
                  v-for="candidate in group.suppleants.candidates"
                  :key="candidate.id"
                  :candidate="candidate"
                  @select="openCandidateModal"
                />
              </div>
            </template>
          </UAccordion>
        </div>
      </template>
    </div>

    <!-- Empty State (seulement pour législatives et locales) -->
    <div v-else-if="!isPresidential" class="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 shadow-inner">
        <UIcon name="i-heroicons-user-group" class="h-20 w-20 mx-auto mb-4 text-gray-200 dark:text-gray-800" />
        <h4 class="text-lg font-bold text-gray-400">Aucun résultat</h4>
        <p class="text-sm text-gray-500 max-w-xs mx-auto">Essayez de changer les filtres ou de modifier votre recherche.</p>
    </div>

    <!-- Candidate Detail Modal -->
    <ElectionsDashboardModalsCandidateDetailModal
      v-model="isModalOpen"
      :candidate="selectedCandidate"
    />
  </div>
</template>
