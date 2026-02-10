<script setup lang="ts">
import { useElectoralDashboard } from '~/composables/elections/dashboard/useElectoralDashboard';

/**
 * Page Carte Électorale - Sénégal
 */

const route = useRoute();
const router = useRouter();

// Sélecteurs d'élection
const selectedType = ref<string>((route.query.type as string) || '');
const selectedYear = ref<string>((route.query.year as string) || '');
const { config } = useElectoralDashboard();

// Calcul de l'élection sélectionnée
const selectedElection = computed(() => {
  if (!config.value?.elections || !selectedType.value || !selectedYear.value) return null;

  return config.value.elections.find(e =>
    e.type === selectedType.value && e.year === parseInt(selectedYear.value)
  ) || null;
});

// SEO dynamique avec le nom de l'élection
useSeoMeta({
  title: () => selectedElection.value
    ? `Carte Électorale - ${selectedElection.value.name} | Élections Sénégal`
    : 'Carte Électorale | Élections Sénégal',
  description: () => selectedElection.value
    ? `Explorez la cartographie électorale pour ${selectedElection.value.name} : lieux de vote, bureaux et statistiques par département et diaspora.`
    : 'Explorez la cartographie électorale du Sénégal : lieux de vote, répartition géographique et statistiques.',
  ogTitle: () => selectedElection.value
    ? `Carte Électorale - ${selectedElection.value.name}`
    : 'Carte Électorale | Élections Sénégal',
  ogDescription: () => selectedElection.value
    ? `Visualisez les données électorales pour ${selectedElection.value.name} à travers le territoire national et la diaspora.`
    : 'Visualisez les données électorales du Sénégal.',
});



const typeLabels: Record<string, string> = {
  'presidential': 'Présidentielles',
  'legislative': 'Législatives',
  'locale': 'Locales'
};

// Élections complétées triées par année décroissante
const completedElections = computed(() => {
  if (!config.value?.elections) return [];
  return config.value.elections
    .filter(e => e.status === 'completed')
    .sort((a, b) => b.year - a.year);
});

// Trouver la dernière élection completed pour un type donné
const getLatestElectionForType = (type: string) => {
  return completedElections.value.find(e => e.type === type);
};

// Initialiser avec la dernière élection completed et rediriger si nécessaire
watch(config, (newConfig) => {
  if (newConfig?.elections && completedElections.value.length > 0) {
    const hasTypeInUrl = route.query.type;
    const hasYearInUrl = route.query.year;

    // Si pas de type sélectionné ou type invalide, prendre la dernière élection
    if (!selectedType.value || !completedElections.value.some(e => e.type === selectedType.value)) {
      const latestElection = completedElections.value[0];
      selectedType.value = latestElection.type;
      selectedYear.value = latestElection.year.toString();

      // Rediriger si pas de params dans l'URL
      if (!hasTypeInUrl || !hasYearInUrl) {
        router.replace({
          query: {
            type: latestElection.type,
            year: latestElection.year.toString(),
          }
        });
      }
    } else if (!selectedYear.value) {
      // Type valide mais pas d'année, prendre la dernière de ce type
      const latestForType = getLatestElectionForType(selectedType.value);
      if (latestForType) {
        selectedYear.value = latestForType.year.toString();

        // Rediriger si pas d'année dans l'URL
        if (!hasYearInUrl) {
          router.replace({
            query: {
              ...route.query,
              year: latestForType.year.toString(),
            }
          });
        }
      }
    }
  }
}, { immediate: true });

// Quand le type change, basculer sur la dernière année de ce type
watch(selectedType, (newType, oldType) => {
  if (newType && newType !== oldType) {
    const latestForType = getLatestElectionForType(newType);
    if (latestForType) {
      selectedYear.value = latestForType.year.toString();
    }
  }
});

// Calcul de l'élection ID sélectionnée (converti en string)
const selectedElectionId = computed(() => {
  return selectedElection.value?.id ? String(selectedElection.value.id) : null;
});

// Vérifier si c'est une élection locale
const isLocalElection = computed(() => {
  return selectedType.value === 'locale';
});

// Panel département (affiché à droite de la page)
const selectedDepartmentData = ref<any>(null);
const isDepartmentPanelOpen = ref(false);

const handleDepartmentSelected = (dept: any) => {
  selectedDepartmentData.value = dept;
  isDepartmentPanelOpen.value = true;
};

const closeDepartmentPanel = () => {
  isDepartmentPanelOpen.value = false;
  setTimeout(() => {
    selectedDepartmentData.value = null;
  }, 300);
};

// Options pour les sélecteurs
const typeOptions = computed(() => {
  if (!completedElections.value.length) return [];

  const types = new Set(completedElections.value.map(e => e.type));

  return Array.from(types).map(type => ({
    label: typeLabels[type] || type,
    value: type
  }));
});

const yearOptions = computed(() => {
  if (!completedElections.value.length || !selectedType.value) return [];

  const yearsSet = new Set(
    completedElections.value
      .filter(e => e.type === selectedType.value)
      .map(e => e.year)
  );

  return Array.from(yearsSet)
    .sort((a, b) => b - a)
    .map(year => ({
      label: year.toString(),
      value: year.toString()
    }));
});

// Sync URL avec les sélecteurs
watch([selectedType, selectedYear], () => {
  if (selectedType.value && selectedYear.value) {
    router.replace({
      query: {
        ...route.query,
        type: selectedType.value,
        year: selectedYear.value,
      }
    });
  }
});

const optionMap = "Vue Carte";
const optionList = "Vue Liste";
const selectedOptions = ref(optionMap);

const listViewTypes = [
  {
    label: optionMap,
    icon: "i-heroicons-map-solid",
  },
  {
    label: optionList,
    icon: "i-heroicons-list-bullet-solid",
  },
];

const tabs = computed(() => {
  const baseTabs = [
    {
      label: "Nationale",
      icon: "i-heroicons-map",
      slot: "nationale",
    },
    {
      label: "Résumé",
      icon: "i-heroicons-chart-bar",
      slot: "resume",
    },
  ];

  // Ajouter l'onglet Diaspora uniquement pour les élections présidentielles et législatives
  if (!isLocalElection.value) {
    baseTabs.splice(1, 0, {
      label: "Diaspora",
      icon: "i-heroicons-globe-europe-africa",
      slot: "diaspora",
    });
  }

  return baseTabs;
});

// État pour gérer l'absence de données de carte
const mapDataAvailable = ref(true);
const listDataAvailable = ref(true);
const mapKey = ref(0); // Clé pour forcer le rechargement du composant

// Gestionnaire quand la carte est prête
const handleMapReady = () => {
  mapDataAvailable.value = true;
};

// Gestionnaire pour les erreurs de chargement de carte
const handleMapError = () => {
  mapDataAvailable.value = false;
};

// Gestionnaire pour la liste vide
const handleListEmpty = () => {
  listDataAvailable.value = false;
};

const handleListReady = () => {
  listDataAvailable.value = true;
};

// Reset des états quand l'élection change
watch(selectedElectionId, (newId, oldId) => {
  if (newId !== oldId) {
    mapDataAvailable.value = true;
    listDataAvailable.value = true;
    mapKey.value++;
    isDepartmentPanelOpen.value = false;
    selectedDepartmentData.value = null;
  }
});
</script>

<template>
  <div class="flex flex-col items-center px-4 py-8 min-h-screen">
    <div class="w-full max-w-7xl mb-4">
      <!-- Breadcrumb -->
      <UBreadcrumb
        class="mb-6"
        :links="[
          { label: 'Accueil', to: '/' },
          { label: 'Élections', to: '/elections-senegal' },
          { label: selectedElection?.name || 'Carte Électorale' },
        ]"
      />

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 class="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 dark:text-white">Carte Électorale</h1>
          <p class="text-gray-500 dark:text-gray-400 max-w-3xl">
            Visualisez les données électorales à travers le territoire national.
            <template v-if="isLocalElection">
              Sélectionnez une commune pour des informations détaillées.
            </template>
            <template v-else>
              Sélectionnez une région ou un département pour des informations détaillées.
            </template>
          </p>
        </div>

        <!-- Sélecteurs d'élection -->
        <div class="flex flex-col md:flex-row items-stretch md:items-center gap-3">
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

    <!-- Main Content Tabs -->
    <div class="w-full max-w-7xl">
      <ClientOnly>
        <UTabs :items="tabs" class="w-full">
          <!-- NATIONALE -->
          <template #nationale>
          <div class="w-full pt-4">
            <!-- View Toggle -->
            <div class="mb-4 w-full flex justify-center">
              <div class="flex gap-2">
                <UButton
                  v-for="option in listViewTypes"
                  :key="option.label"
                  :color="selectedOptions === option.label ? 'white' : 'gray'"
                  :variant="selectedOptions === option.label ? 'solid' : 'ghost'"
                  size="md"
                  class="shadow-sm"
                  @click="selectedOptions = option.label"
                >
                  <UIcon :name="option.icon" class="w-5 h-5 mr-1" />
                  {{ option.label }}
                </UButton>
              </div>
            </div>

            <!-- CARTE -->
            <div v-if="selectedOptions == optionMap">
              <!-- Message si pas de données disponibles -->
              <div v-if="!mapDataAvailable" class="flex flex-col items-center justify-center py-16 text-center">
                <UIcon name="i-heroicons-map" class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 class="text-lg font-bold text-gray-600 dark:text-gray-400 mb-2">Données cartographiques non disponibles</h3>
                <p class="text-sm text-gray-500 dark:text-gray-500 max-w-md">
                  Les données de la carte électorale pour cette élection ne sont pas encore disponibles.
                </p>
              </div>
              <ElectionMapComponent4
                v-else
                :key="`map-${mapKey}`"
                :election-id="selectedElectionId"
                :is-local-election="isLocalElection"
                @map-ready="handleMapReady"
                @map-error="handleMapError"
                @department-selected="handleDepartmentSelected"
              />
            </div>

            <!-- LISTE -->
            <div v-else-if="selectedOptions == optionList" class="w-full">
              <!-- Message si pas de données disponibles -->
              <div v-if="!listDataAvailable" class="flex flex-col items-center justify-center py-16 text-center">
                <UIcon name="i-heroicons-list-bullet" class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 class="text-lg font-bold text-gray-600 dark:text-gray-400 mb-2">Données non disponibles</h3>
                <p class="text-sm text-gray-500 dark:text-gray-500 max-w-md">
                  Les données départementales pour cette élection ne sont pas encore disponibles.
                </p>
              </div>
              <ElectionMapNationalDepartment
                v-else
                :key="`list-${mapKey}`"
                :election-id="selectedElectionId"
                @list-empty="handleListEmpty"
                @list-ready="handleListReady"
              />
            </div>
          </div>
        </template>

        <!-- DIASPORA (uniquement pour présidentielle/législative) -->
        <template #diaspora>
          <div class="w-full pt-4">
            <ElectionMapDiasporaCountries :key="`diaspora-${mapKey}`" :election-id="selectedElectionId" />
          </div>
        </template>

        <!-- Résumé -->
        <template #resume>
          <div class="w-full pt-4">
            <ElectionMapSummary :key="`summary-${mapKey}`" :election-id="selectedElectionId" />
          </div>
        </template>
        </UTabs>
        <template #fallback>
          <div class="flex items-center justify-center py-16">
            <div class="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-primary-600"></div>
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Panel département (affiché à droite de la page) -->
    <ElectionMapDepartmentPanel
      :department="selectedDepartmentData"
      :is-open="isDepartmentPanelOpen"
      :election-id="selectedElectionId"
      @close="closeDepartmentPanel"
    />
  </div>
</template>
