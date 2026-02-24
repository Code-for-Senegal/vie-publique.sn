<template>
  <div class="container mx-auto min-h-screen px-4 py-8 pb-16">
    <AppBreadcrumb
      :items="[
        { label: 'Budget', to: '/budget-senegal' },
        { label: 'Institutions' }
      ]"
    />

    <!-- Header -->
    <div class="mb-8">
      <h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
        Budgets des Institutions
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Répartition budgétaire par institution pour l'année {{ selectedYear }}
      </p>
    </div>

    <!-- Filtres -->
    <div class="mb-6 flex flex-col gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800 sm:flex-row">
      <!-- Sélecteur année-version combiné -->
      <USelect
        v-model="selectedYearVersion"
        :options="yearVersionOptions"
        option-attribute="label"
        value-attribute="value"
        size="md"
        :loading="loadingYears"
        placeholder="Sélectionner une version"
        class="w-full sm:w-64"
        @update:model-value="handleYearVersionChange"
      />

      <!-- Sélecteur de comparaison -->
      <USelect
        v-model="selectedCompareYearVersion"
        :options="compareYearVersionOptions"
        option-attribute="label"
        value-attribute="value"
        size="md"
        placeholder="Comparer avec..."
        class="w-full sm:w-64"
        @update:model-value="handleCompareChange"
      >
        <template #leading>
          <UIcon name="i-heroicons-arrows-right-left" class="h-4 w-4" />
        </template>
      </USelect>

      <!-- Recherche -->
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="Rechercher une institution..."
        size="md"
        class="flex-1"
      />
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <div class="text-center">
        <UIcon name="i-heroicons-arrow-path" class="mx-auto mb-4 h-12 w-12 animate-spin text-gray-400" />
        <p class="text-gray-600 dark:text-gray-400">Chargement des budgets...</p>
      </div>
    </div>

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      title="Erreur de chargement"
      description="Impossible de charger les données des institutions."
      class="mb-6"
    />

    <!-- No results -->
    <div
      v-else-if="filteredInstitutions.length === 0"
      class="rounded-lg bg-gray-50 p-12 text-center dark:bg-gray-800"
    >
      <UIcon name="i-heroicons-building-library" class="mx-auto mb-4 h-16 w-16 text-gray-400" />
      <p class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
        Aucune institution trouvée
      </p>
      <p class="text-gray-600 dark:text-gray-400">
        {{ searchQuery ? `Aucun résultat pour "${searchQuery}"` : 'Aucune donnée disponible pour cette sélection' }}
      </p>
    </div>

    <!-- Tableau des institutions -->
    <div v-else>
      <BudgetBudget2TableMinistryV2 :ministries="filteredInstitutions" :year="selectedYear" :version="selectedVersion" />
    </div>

    <!-- Navigation buttons -->
    <div class="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <UButton
        to="/budget-senegal/ministeres"
        color="gray"
        variant="outline"
        icon="i-heroicons-building-office"
      >
        Voir les Ministères
      </UButton>
      <UButton
        to="/budget-senegal"
        color="gray"
        variant="outline"
        icon="i-heroicons-chart-bar"
      >
        Dashboard complet
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Institution {
  id: number;
  year: number;
  label: string;
  version: number;
  level: string;
  code: string;
  amount_cp: string;
  unit: string;
  entity: {
    name: string;
    id: number;
    logo?: string;
    public_slug?: string;
  };
  variation_percentage?: string | null;
  variation_color?: 'green' | 'red' | 'gray';
  previous_amount?: number | null;
}

// SEO
const title = 'Budgets des Institutions du Sénégal | Répartition par institution';
const description =
  "Découvrez la répartition détaillée des budgets par institution au Sénégal : Assemblée nationale, Présidence, Conseil constitutionnel et autres institutions. Transparence totale des finances publiques.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});

// Structured Data
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'GovernmentService',
        name: 'Budgets des Institutions du Sénégal',
        description: description,
        provider: {
          '@type': 'GovernmentOrganization',
          name: 'République du Sénégal',
        },
        areaServed: {
          '@type': 'Country',
          name: 'Sénégal',
        },
      }),
    },
  ],
});

// State
const searchQuery = ref('');
const selectedYear = ref(2026);
const selectedVersion = ref<number | null>(null);
const selectedCompareYear = ref<number | null>(null);
const selectedCompareVersion = ref<number | null>(null);

// Fetch available years
const { data: yearsData, pending: loadingYears } = await useFetch('/api/budget/years');

// Créer les options combinées année-version
const yearVersionOptions = computed(() => {
  if (!yearsData.value?.years) return [];

  const options: Array<{
    label: string;
    value: string;
    year: number;
    versionId: number | null;
    date: string;
  }> = [];

  yearsData.value.years.forEach((yearData: any) => {
    if (yearData.versions && yearData.versions.length > 0) {
      yearData.versions.forEach((ver: any) => {
        options.push({
          label: `${yearData.year} - ${ver.label}`,
          value: `${yearData.year}-${ver.id}`,
          year: yearData.year,
          versionId: ver.id,
          date: ver.date,
        });
      });
    }
  });

  // Trier par date décroissante (plus récent en premier)
  return options.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
});

// Options de comparaison (seulement les versions antérieures à la sélection actuelle)
const compareYearVersionOptions = computed(() => {
  const currentOption = yearVersionOptions.value.find(
    (opt) => opt.year === selectedYear.value && opt.versionId === selectedVersion.value
  );

  if (!currentOption) return [];

  const currentDate = new Date(currentOption.date);

  // Filtrer uniquement les versions antérieures
  const olderOptions = yearVersionOptions.value.filter((opt) => {
    const optionDate = new Date(opt.date);
    return optionDate < currentDate;
  });

  // Ajouter l'option "Aucune comparaison"
  return [
    { label: 'Aucune comparaison', value: 'none', year: 0, versionId: null, date: '' },
    ...olderOptions,
  ];
});

// Valeur sélectionnée actuelle
const selectedYearVersion = computed(() => {
  if (selectedVersion.value === null) {
    return yearVersionOptions.value[0]?.value || '';
  }
  return `${selectedYear.value}-${selectedVersion.value}`;
});

// Valeur de comparaison sélectionnée
const selectedCompareYearVersion = ref<string>('none');

// Initialiser avec la version la plus récente (2026)
onMounted(() => {
  if (yearVersionOptions.value.length > 0) {
    const latest = yearVersionOptions.value[0];
    selectedYear.value = latest.year;
    selectedVersion.value = latest.versionId;
  }
});

// Gestion du changement de sélection
const handleYearVersionChange = (value: string) => {
  const option = yearVersionOptions.value.find((opt) => opt.value === value);
  if (option) {
    selectedYear.value = option.year;
    selectedVersion.value = option.versionId;
    // Réinitialiser la comparaison quand on change la version principale
    selectedCompareYearVersion.value = 'none';
    selectedCompareYear.value = null;
    selectedCompareVersion.value = null;
  }
};

// Gestion du changement de comparaison
const handleCompareChange = (value: string) => {
  if (value === 'none') {
    selectedCompareYear.value = null;
    selectedCompareVersion.value = null;
  } else {
    const option = yearVersionOptions.value.find((opt) => opt.value === value);
    if (option) {
      selectedCompareYear.value = option.year;
      selectedCompareVersion.value = option.versionId;
    }
  }
};

// Fetch institutions data
const {
  data: institutionsData,
  pending,
  error,
} = await useFetch('/api/budget/ministries', {
  query: computed(() => ({
    year: selectedYear.value,
    version: selectedVersion.value,
    level: 'institution',
    compareYear: selectedCompareYear.value,
    compareVersion: selectedCompareVersion.value,
  })),
  watch: [selectedYear, selectedVersion, selectedCompareYear, selectedCompareVersion],
});

const institutions = computed<Institution[]>(() => {
  return institutionsData.value?.ministries || [];
});

// Filter institutions based on search
const filteredInstitutions = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return institutions.value;

  return institutions.value.filter(
    (i) =>
      i.entity.name.toLowerCase().includes(query) ||
      i.label.toLowerCase().includes(query) ||
      i.code.includes(query)
  );
});

</script>
