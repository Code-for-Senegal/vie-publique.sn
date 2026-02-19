<template>
  <div class="container mx-auto min-h-screen px-4 py-8 pb-16">
    <AppBreadcrumb
      :items="[
        { label: 'Budget', to: '/budget-senegal' },
        { label: 'Ministères' }
      ]"
    />

    <!-- Header -->
    <div class="mb-8">
      <h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Budgets des Ministères</h1>
      <p class="text-gray-600 dark:text-gray-400">
        Répartition budgétaire par ministère pour l'année {{ selectedYear }}
      </p>
    </div>

    <!-- Filtres -->
    <div class="mb-6 flex flex-col gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
      <!-- Ligne 1: Sélecteurs année-version -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Version :</span>
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
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Comparer avec :</span>
          <USelect
            v-model="selectedCompareYearVersion"
            :options="compareYearVersionOptions"
            option-attribute="label"
            value-attribute="value"
            size="md"
            placeholder="Sélectionner..."
            class="w-full sm:w-64"
            :disabled="compareYearVersionOptions.length === 0"
            @update:model-value="handleCompareYearVersionChange"
          />
        </div>
      </div>

      <!-- Ligne 2: Recherche -->
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="Rechercher un ministère..."
        size="md"
        class="w-full"
      />
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <div class="text-center">
        <UIcon
          name="i-heroicons-arrow-path"
          class="mx-auto mb-4 h-12 w-12 animate-spin text-gray-400"
        />
        <p class="text-gray-600 dark:text-gray-400">Chargement des budgets...</p>
      </div>
    </div>

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      title="Erreur de chargement"
      description="Impossible de charger les données des ministères."
      class="mb-6"
    />

    <!-- No results -->
    <div
      v-else-if="filteredMinistries.length === 0"
      class="rounded-lg bg-gray-50 p-12 text-center dark:bg-gray-800"
    >
      <UIcon name="i-heroicons-building-office" class="mx-auto mb-4 h-16 w-16 text-gray-400" />
      <p class="mb-2 text-lg font-medium text-gray-900 dark:text-white">Aucun ministère trouvé</p>
      <p class="text-gray-600 dark:text-gray-400">
        {{
          searchQuery
            ? `Aucun résultat pour "${searchQuery}"`
            : 'Aucune donnée disponible pour cette sélection'
        }}
      </p>
    </div>

    <!-- Tableau des ministères -->
    <div v-else>
      <BudgetBudget2TableMinistryV2 :ministries="filteredMinistries" :year="selectedYear" :version="selectedVersion" />
    </div>

    <!-- Navigation buttons -->
    <div class="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <UButton
        to="/budget/institutions"
        color="gray"
        variant="outline"
        icon="i-heroicons-building-library"
      >
        Voir les Institutions
      </UButton>
      <UButton to="/budget-senegal" color="gray" variant="outline" icon="i-heroicons-chart-bar">
        Dashboard complet
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Ministry {
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
const title = 'Budgets des Ministères du Sénégal | Répartition par ministère';
const description =
  'Découvrez la répartition détaillée des budgets par ministère au Sénégal : montants alloués, évolutions et comparaisons pour une transparence totale des finances publiques.';

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
        name: 'Budgets des Ministères du Sénégal',
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

// Valeur sélectionnée actuelle
const selectedYearVersion = computed(() => {
  if (selectedVersion.value === null) {
    return yearVersionOptions.value[0]?.value || '';
  }
  return `${selectedYear.value}-${selectedVersion.value}`;
});

// Options pour le select de comparaison (uniquement les versions antérieures)
const compareYearVersionOptions = computed(() => {
  const currentOption = yearVersionOptions.value.find(
    (opt) => opt.year === selectedYear.value && opt.versionId === selectedVersion.value,
  );

  if (!currentOption) return [];

  const currentDate = new Date(currentOption.date);

  // Filtrer pour ne garder que les versions dont la date est strictement antérieure
  return yearVersionOptions.value.filter((opt) => {
    if (opt.versionId === selectedVersion.value && opt.year === selectedYear.value) return false;
    const optionDate = new Date(opt.date);
    return optionDate < currentDate;
  });
});

// Valeur sélectionnée de comparaison
const selectedCompareYearVersion = computed({
  get: () => {
    if (!selectedCompareYear.value || !selectedCompareVersion.value) return '';
    return `${selectedCompareYear.value}-${selectedCompareVersion.value}`;
  },
  set: (value: string) => {
    if (!value) {
      selectedCompareYear.value = null;
      selectedCompareVersion.value = null;
    }
  },
});

// Initialiser avec la version la plus récente (2026)
onMounted(() => {
  if (yearVersionOptions.value.length > 0) {
    const latest = yearVersionOptions.value[0];
    selectedYear.value = latest.year;
    selectedVersion.value = latest.versionId;
  }

  // Initialiser la comparaison par défaut
  nextTick(() => {
    initializeDefaultComparison();
  });
});

// Réinitialiser la comparaison quand les options changent
watch(compareYearVersionOptions, () => {
  nextTick(() => {
    initializeDefaultComparison();
  });
});

// Gestion du changement de sélection
const handleYearVersionChange = (value: string) => {
  const option = yearVersionOptions.value.find((opt) => opt.value === value);
  if (option) {
    selectedYear.value = option.year;
    selectedVersion.value = option.versionId;
    // Reset la comparaison
    selectedCompareYear.value = null;
    selectedCompareVersion.value = null;
  }
};

// Gestion du changement de comparaison
const handleCompareYearVersionChange = (value: string) => {
  if (!value) {
    selectedCompareYear.value = null;
    selectedCompareVersion.value = null;
    return;
  }
  const option = yearVersionOptions.value.find((opt) => opt.value === value);
  if (option) {
    selectedCompareYear.value = option.year;
    selectedCompareVersion.value = option.versionId;
  }
};

// Initialiser la comparaison par défaut
const initializeDefaultComparison = () => {
  const options = compareYearVersionOptions.value;
  if (options.length > 0 && !selectedCompareYear.value) {
    const defaultCompare = options[0];
    selectedCompareYear.value = defaultCompare.year;
    selectedCompareVersion.value = defaultCompare.versionId;
  }
};

// Fetch ministries data
const {
  data: ministriesData,
  pending,
  error,
} = await useFetch('/api/budget/ministries', {
  query: computed(() => ({
    year: selectedYear.value,
    version: selectedVersion.value,
    level: 'ministry',
    compareYear: selectedCompareYear.value,
    compareVersion: selectedCompareVersion.value,
  })),
  watch: [selectedYear, selectedVersion, selectedCompareYear, selectedCompareVersion],
});

const ministries = computed<Ministry[]>(() => {
  const data = ministriesData.value?.ministries || [];
  // Debug: afficher les 2 premiers items
  if (data.length > 0) {
    console.log('[Ministères Page] Premier ministère:', {
      name: data[0].entity?.name,
      amount: data[0].amount_cp,
      variation: data[0].variation_percentage,
      variation_color: data[0].variation_color,
    });
  }
  return data;
});

// Filter ministries based on search
const filteredMinistries = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return ministries.value;

  return ministries.value.filter(
    (m) =>
      m.entity.name.toLowerCase().includes(query) ||
      m.label.toLowerCase().includes(query) ||
      m.code.includes(query),
  );
});
</script>
