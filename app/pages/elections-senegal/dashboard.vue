<script setup lang="ts">
import { useElectoralDashboard } from '~/composables/elections/dashboard/useElectoralDashboard';
import { useElectoralCoalitions } from '~/composables/elections/dashboard/useElectoralCoalitions';
import { useElectoralConstituencies } from '~/composables/elections/dashboard/useElectoralConstituencies';
import { useElectoralProfessions } from '~/composables/elections/dashboard/useElectoralProfessions';
import { useElectoralStatsList } from '~/composables/elections/dashboard/useElectoralStatsList';

/**
 * Dashboard Électoral - Page Principale
 */

// 1. Initialisation du Dashboard
const dashboard = useElectoralDashboard();
const {
  selectedYear,
  selectedType,
  activeTab,
  selectedConstituencyId,
  selectedCoalitionId,
  config,
  currentElection,
  loadingConfig,
  selectConstituency,
  clearConstituency,
  selectCoalition,
  clearCoalition
} = dashboard;

import ElectionResultatsStats from '~/components/elections/dashboard/stats/ElectionResultatsStats.vue';

// --- STATISTIQUES LOGIC ---
const statsTypes = [
  { label: "Résultats Globaux", value: "results" },
  { label: "Métiers des députés", value: "professionDeputy" },
  { label: "Profession des candidats", value: "professionCandidat" },
  { label: "Présences des listes par département", value: "departmental" },
  { label: "Répartition des électeurs par sexe", value: "genderDistribution" },
  { label: "Répartition des électeurs par âge", value: "ageDistribution" },
];

const route = useRoute();
const router = useRouter();
const statsType = ref<string>("results");

// Sync statsType with query params
if (process.client) {
    if (route.query.stats_type) {
        const found = statsTypes.find(t => t.value === route.query.stats_type);
        if (found) statsType.value = found.value;
    }

    watch(statsType, (newType) => {
        router.replace({ query: { ...route.query, stats_type: newType } });
    });
}

// Fetch Stats Data
const {
  data: professions,
  pending: loadingProfessions,
  error: errorProfessions,
} = useElectoralProfessions({
    year: selectedYear,
    type: selectedType
});

const {
  data: statsDepartmental,
  pending: loadingDepertmental,
  error: errorDepertmental,
} = useElectoralStatsList({
    year: selectedYear,
    type: selectedType
});


// 2. Déterminer si c'est une élection locale
const isLocalElection = computed(() => selectedType.value === 'locale');

// 3. Fetch des circonscriptions pour les élections locales
const {
  constituencies,
  loading: loadingConstituencies
} = useElectoralConstituencies({
  year: selectedYear,
  type: selectedType
});

// 4. Fetch des coalitions (pour présidentielle et législatives)
const {
  coalitions,
  loading: loadingCoalitions
} = useElectoralCoalitions({
  year: selectedYear,
  type: selectedType,
  ranking: true
});

// 5. Récupérer le nom de la circonscription sélectionnée
const selectedConstituencyName = computed(() => {
  if (!selectedConstituencyId.value) return '';
  const constituency = constituencies.value.find(c => c.id === selectedConstituencyId.value);
  return constituency?.name || '';
});

// 6. Configuration des Onglets (Architecture scalable)
const tabs = computed(() => [
  {
    id: "candidats",
    label: selectedType.value === 'presidential' ? 'Candidats' : (selectedType.value === 'local' ? 'Circonscriptions' : 'Coalitions'),
    icon: "i-heroicons-user-group"
  },
  { id: "carte", label: "Carte", icon: "i-heroicons-map" },
  { id: "resultats", label: "Résultats", icon: "i-heroicons-chart-bar" },
  { id: "documents", label: "Documents", icon: "i-heroicons-document-duplicate" },
  { id: "statistiques", label: "Stats", icon: "i-heroicons-presentation-chart-line" },
  { id: "guide", label: "Guide", icon: "i-heroicons-play-circle" },
]);

const currentTabIndex = computed({
  get: () => {
    const idx = tabs.value.findIndex((t) => t.id === activeTab.value);
    return idx === -1 ? 0 : idx;
  },
  set: (index) => {
    activeTab.value = tabs.value[index].id;
  },
});

// 4. SEO Dynamique
useHead({
  title: computed(() => `Dashboard ${selectedType.value === 'legislative' ? 'Législatives' : 'Élections'} ${selectedYear.value} | Vie-Publique SN`),
  meta: [
    { name: "description", content: "Découvrez les listes, candidats et statistiques des élections au Sénégal." },
    { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" }
  ]
});
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
    <!-- Header & Navigation Sticky -->
    <ElectionsDashboardElectoralDashboardHeader
      :selected-year="selectedYear"
      :selected-type="selectedType"
      :config="config"
      @update:year="selectedYear = $event"
      @update:type="selectedType = $event"
      @clear-coalition="clearConstituency"
    >
      <template #tabs>
        <ElectionsDashboardElectoralDashboardTabs
          v-model="currentTabIndex"
          :selected-type="selectedType"
        />
      </template>
    </ElectionsDashboardElectoralDashboardHeader>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Breadcrumb / Back Navigation -->
      <nav class="mb-8 flex items-center justify-between">
        <NuxtLink to="/elections-senegal" class="flex items-center text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors">
          <UIcon name="i-heroicons-arrow-left" class="mr-2" />
          Accueil Élections
        </NuxtLink>
        <div class="flex items-center gap-2">
           <UBadge color="gray" variant="soft" class="rounded-full">Dashboard</UBadge>
        </div>
      </nav>

      <!-- Section: Détails de l'élection -->
      <transition name="fade">
        <ElectionsDashboardElectoralDetailsCard
          v-if="currentElection && !selectedCoalitionId && !selectedConstituencyId"
          :election="currentElection"
          class="mb-10 animate-in fade-in slide-in-from-top-4 duration-700"
        />
      </transition>

      <!-- State: Loading Configuration -->
      <div v-if="loadingConfig" class="flex flex-col items-center justify-center py-32 space-y-4">
         <div class="relative h-16 w-16">
            <div class="absolute inset-0 border-4 border-primary-200 dark:border-primary-900 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
         </div>
         <p class="text-sm font-bold text-gray-400 animate-pulse">Synchronisation avec le CMS...</p>
      </div>

      <div v-else class="max-w-7xl mx-auto">
        <!-- Dashboard Section: Candidats/Coalitions/Circonscriptions (Tab ID: candidats) -->
        <section v-if="activeTab === 'candidats'" class="space-y-8">

          <!-- NIVEAU 3: Detail Coalition (pour tous les types) -->
          <div v-if="selectedCoalitionId" class="animate-in fade-in zoom-in-95 duration-500">
            <ElectionsDashboardCoalitionDetails
              :coalition-id="selectedCoalitionId"
              :coalition-name="coalitions.find(c => c.id === selectedCoalitionId)?.name"
              :year="selectedYear"
              :type="selectedType"
              :constituency-id="dashboard.selectedFilterConstituencyId.value"
              @close="clearCoalition"
            />
          </div>

          <!-- NIVEAU 2: Coalitions d'une circonscription (élections locales seulement) -->
          <div v-else-if="isLocalElection && selectedConstituencyId" class="animate-in fade-in zoom-in-95 duration-500">
            <ElectionsDashboardConstituencyCoalitions
              :constituency-id="selectedConstituencyId"
              :constituency-name="selectedConstituencyName"
              :year="selectedYear"
              :type="selectedType"
              @close="clearConstituency"
              @select-coalition="(payload: any) => {
                  if (typeof payload === 'object') {
                      selectCoalition(payload.coalitionId);
                      dashboard.selectedFilterConstituencyId.value = payload.constituencyId;
                  } else {
                      selectCoalition(payload);
                  }
              }"
            />
          </div>

          <!-- NIVEAU 1: Grille principale -->
          <div v-else class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 class="text-3xl font-black uppercase tracking-tighter">
                  {{ isLocalElection ? 'Les Circonscriptions' : (selectedType === 'presidential' ? 'Les Candidats' : 'Les Coalitions') }}
                </h2>
                <p class="text-gray-500">
                  {{ isLocalElection ? 'Sélectionnez une circonscription pour voir les coalitions en lice.' : (selectedType === 'presidential' ? 'Sélectionnez un candidat pour voir son programme et ses informations.' : 'Sélectionnez une plateforme pour voir ses listes et candidats.') }}
                </p>
              </div>
              <UBadge size="lg" color="white" class="shadow-sm border dark:border-gray-800">
                <span class="text-primary-600 font-black mr-1">{{ isLocalElection ? constituencies.length : coalitions.length }}</span>
                {{ isLocalElection ? 'circonscriptions' : (selectedType === 'presidential' ? 'candidats' : 'plateformes engagées') }}
              </UBadge>
            </div>

            <!-- ÉLECTIONS LOCALES: Grille des circonscriptions -->
            <template v-if="isLocalElection">
              <!-- Loading -->
              <ElectionsDashboardCoalitionGridLoadingState v-if="loadingConstituencies" />

              <!-- Grille circonscriptions -->
              <div v-else-if="constituencies.length > 0" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <ElectionsDashboardCardsConstituencyCard
                  v-for="constituency in constituencies"
                  :key="constituency.id"
                  :constituency="constituency"
                  @select="selectConstituency"
                />
              </div>

              <!-- Empty State -->
              <ElectionsDashboardEmptyStateCoalitions v-else />
            </template>

            <!-- ÉLECTIONS PRÉSIDENTIELLES & LÉGISLATIVES: Grille des coalitions -->
            <template v-else>
              <!-- Loading -->
              <ElectionsDashboardCoalitionGridLoadingState v-if="loadingCoalitions" />

              <!-- Grille PRÉSIDENTIELLE : Candidat en avant -->
              <div v-else-if="coalitions.length > 0 && selectedType === 'presidential'" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <ElectionsDashboardCardsPresidentialCoalitionCard
                  v-for="coalition in coalitions"
                  :key="coalition.id"
                  :coalition="coalition"
                  @select="selectCoalition"
                />
              </div>

              <!-- Grille LÉGISLATIVES : Coalition en avant -->
              <div v-else-if="coalitions.length > 0" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <ElectionsDashboardCardsLegislativeCoalitionCard
                  v-for="coalition in coalitions"
                  :key="coalition.id"
                  :coalition="coalition"
                  @select="selectCoalition"
                />
              </div>

              <!-- Empty State -->
              <ElectionsDashboardEmptyStateCoalitions v-else />
            </template>
          </div>
        </section>

        <!-- Dashboard Section: Carte (Tab ID: carte) -->
        <section v-else-if="activeTab === 'carte'" class="animate-in fade-in duration-700">
             <div class="bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden border dark:border-gray-800 shadow-2xl">
                <div class="p-6 border-b dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
                    <div>
                        <h2 class="text-2xl font-black uppercase tracking-tighter">Carte Électorale</h2>
                        <p class="text-sm text-gray-500">Visualisation géographique par département.</p>
                    </div>
                </div>
                <div class="relative min-h-[600px]">
                    <ElectionMapComponent4 />
                </div>
             </div>
        </section>

        <!-- Dashboard Section: Statistiques (Tab ID: statistiques) -->
        <section v-else-if="activeTab === 'statistiques'" class="animate-in fade-in duration-700">
            <div class="space-y-6">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 class="text-2xl font-black uppercase tracking-tighter">Statistiques</h2>
                        <p class="text-gray-500">Chiffres clés et analyses graphiques.</p>
                    </div>
                    <USelect
                        v-model="statsType"
                        :options="statsTypes"
                        placeholder="Choisir une statistique"
                        class="w-full md:w-72"
                    />
                </div>

                <div class="bg-white dark:bg-gray-900 rounded-xl p-6 border dark:border-gray-800 shadow-sm min-h-[400px]">
                    <!-- Loading States -->
                    <div v-if="loadingProfessions || loadingDepertmental" class="flex justify-center items-center h-64">
                         <div class="flex flex-col items-center space-y-2">
                             <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500" />
                             <span class="text-sm text-gray-400">Chargement des données...</span>
                         </div>
                    </div>

                    <!-- Errors -->
                    <UAlert v-else-if="errorProfessions || errorDepertmental" type="danger" title="Erreur de chargement">
                        {{ errorProfessions || errorDepertmental }}
                    </UAlert>

                    <!-- Content -->
                    <div v-else>
                          <ElectionResultatsStats
                            v-if="statsType == 'results' && coalitions?.length > 0"
                            :coalitions="coalitions"
                            :type="selectedType"
                          />

                         <ElectionCandidatProfessionDeputies
                            v-if="statsType == 'professionDeputy'"
                          />

                          <ElectionCandidatProfessionChart
                            v-if="statsType == 'professionCandidat' && professions && professions?.length > 0"
                            :professions="professions"
                          />

                          <ElectionStatsElectoralList
                            v-if="statsType == 'departmental' && coalitions?.length > 0"
                            :stats-departmental="statsDepartmental"
                            :coalitions="coalitions"
                          />

                          <ElectionGenderDistributionChart
                            v-if="statsType == 'genderDistribution'"
                          />
                          <ElectionAgeDistributionChart v-if="statsType == 'ageDistribution'" />
                    </div>
                </div>
            </div>
        </section>

        <!-- Dashboard Section: Guide de vote (Tab ID: guide) -->
        <section v-else-if="activeTab === 'guide'" class="animate-in fade-in duration-700">
          <ElectionsDashboardGuideElectoralVideos :type-election="selectedType" />
        </section>
        
        <!-- Dashboard Section: Documents (Tab ID: documents) -->
        <section v-else-if="activeTab === 'documents'" class="animate-in fade-in duration-700">
           <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-2xl font-black uppercase tracking-tighter">Documents Officiels</h2>
                  <p class="text-gray-500">Retrouvez les textes et documents liés à ce scrutin.</p>
                </div>
                <UButton to="/elections-senegal/legislation" variant="ghost" icon="i-heroicons-arrow-top-right-on-square">
                  Voir toute la législation
                </UButton>
              </div>
              
              <div class="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border dark:border-gray-800 shadow-sm min-h-[300px]">
                 <!-- Documents rattachés à l'élection actuelle -->
                 <div v-if="currentElection">
                    <ElectionsDashboardDocumentsTab 
                      :election-id="currentElection.id" 
                      :election-name="currentElection.name"
                    />
                 </div>
              </div>
           </div>
        </section>

        <!-- Placeholder for other tabs -->
        <section v-else class="text-center py-32 bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
             <UIcon name="i-heroicons-puzzle-piece" class="h-20 w-20 text-primary-200 dark:text-primary-900 mx-auto mb-6 opacity-50" />
             <h3 class="text-2xl font-black text-gray-300 dark:text-gray-700 uppercase tracking-tighter italic">Innovation en cours</h3>
             <p class="text-gray-400 max-w-sm mx-auto mt-4 px-6 italic">Le module "{{ activeTab }}" est en phase finale d'intégration. Restez connectés pour les résultats détaillés.</p>
             <UButton class="mt-8 rounded-full px-8" variant="soft" @click="activeTab = 'candidats'">Voir les candidats</UButton>
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-20 border-t dark:border-gray-800 bg-white dark:bg-gray-950 py-12">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                   <h5 class="text-lg font-black uppercase text-gray-400 italic">Plateforme Électorale</h5>
                   <p class="text-xs text-gray-500 mt-2 max-w-md">Source officielle des listes électorales validées par la Direction Générale des Élections (DGE) du Sénégal. Cette plateforme assure la transparence et l'accessibilité à l'information publique.</p>
                </div>
            </div>
        </div>
    </footer>
  </div>
</template>

<style>
.container {
  max-width: 1400px;
}

/* Animations transitions smooth */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
