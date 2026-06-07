<template>
  <div class="min-h-screen bg-white pb-24 dark:bg-gray-950">
    <!-- Sticky Header Mobile -->
    <header
      class="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/95 md:hidden"
    >
      <div class="flex items-center gap-3 px-4 py-2.5">
        <NuxtLink
          to="/budget-senegal"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 transition-colors active:bg-gray-200 dark:bg-gray-800 dark:active:bg-gray-700"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </NuxtLink>
        <div class="min-w-0 flex-1">
          <p
            class="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
          >
            Budget {{ selectedYear }}
          </p>
          <h1 class="truncate text-base font-semibold text-gray-900 dark:text-white">Ministères</h1>
        </div>
        <span
          class="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
        >
          {{ filteredMinistries.length }}
        </span>
      </div>

      <!-- Mobile Stats Bar -->
      <div
        v-if="totalBudget && !pending"
        class="flex items-center justify-between border-t border-gray-50 bg-gray-50/50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900/50"
      >
        <span class="text-[11px] text-gray-500 dark:text-gray-400">Budget total</span>
        <span class="text-xs font-semibold text-gray-900 dark:text-white"
          >{{ formatBudget(totalBudget) }} FCFA</span
        >
      </div>
    </header>

    <!-- Desktop Layout -->
    <div class="hidden md:block">
      <!-- Top Bar -->
      <div class="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center gap-4">
            <NuxtLink
              to="/budget-senegal"
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <UIcon
                name="i-heroicons-arrow-left"
                class="h-5 w-5 text-gray-700 dark:text-gray-300"
              />
            </NuxtLink>
            <nav class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <NuxtLink to="/budget-senegal" class="hover:text-gray-900 dark:hover:text-white"
                >Budget</NuxtLink
              >
              <UIcon name="i-heroicons-chevron-right" class="h-4 w-4" />
              <span class="font-medium text-gray-900 dark:text-white">Ministères</span>
            </nav>
          </div>
        </div>
      </div>

      <!-- Hero Content -->
      <div
        class="border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white dark:border-gray-800 dark:from-gray-900 dark:to-gray-950"
      >
        <div class="container mx-auto px-6 py-12">
          <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <!-- Left: Title -->
            <div class="max-w-2xl">
              <div
                class="mb-4 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 dark:bg-gray-800"
              >
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-600 dark:bg-gray-500"
                >
                  <UIcon name="i-heroicons-building-office-2" class="h-3.5 w-3.5 text-white" />
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Exercice {{ selectedYear }}
                </span>
              </div>

              <h1
                class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white lg:text-4xl"
              >
                Budgets des Ministères
              </h1>

              <p class="mt-3 text-lg text-gray-600 dark:text-gray-400">
                Répartition détaillée des crédits de paiement
              </p>
            </div>

            <!-- Right: Stats -->
            <div class="flex gap-4">
              <div
                class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800"
                  >
                    <UIcon
                      name="i-heroicons-building-office-2"
                      class="h-6 w-6 text-gray-600 dark:text-gray-400"
                    />
                  </div>
                  <div>
                    <p class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {{ filteredMinistries.length }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Ministères</p>
                  </div>
                </div>
              </div>
              <div
                v-if="totalBudget"
                class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800"
                  >
                    <UIcon
                      name="i-heroicons-banknotes"
                      class="h-6 w-6 text-gray-600 dark:text-gray-400"
                    />
                  </div>
                  <div>
                    <p class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {{ formatBudget(totalBudget) }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Total CP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <main class="container mx-auto px-4 py-4 md:px-6 md:py-8">
      <!-- Filtres Card -->
      <div
        class="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900 md:rounded-2xl md:p-5"
      >
        <div class="flex flex-col gap-3 md:gap-4">
          <!-- Row 1: Selectors -->
          <div class="flex flex-col gap-3 md:flex-row md:gap-4">
            <div class="flex-1">
              <label
                class="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 md:mb-2 md:text-sm md:text-gray-700 md:dark:text-gray-300"
              >
                <UIcon name="i-heroicons-calendar" class="h-3.5 w-3.5 md:h-4 md:w-4" />
                Version
              </label>
              <USelect
                v-model="selectedYearVersion"
                :options="yearVersionOptions"
                option-attribute="label"
                value-attribute="value"
                size="md"
                :loading="loadingYears"
                placeholder="Sélectionner"
                class="w-full"
                @update:model-value="handleYearVersionChange"
              />
            </div>

            <div class="flex-1">
              <label
                class="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 md:mb-2 md:text-sm md:text-gray-700 md:dark:text-gray-300"
              >
                <UIcon name="i-heroicons-arrows-right-left" class="h-3.5 w-3.5 md:h-4 md:w-4" />
                Comparer
              </label>
              <USelect
                v-model="selectedCompareYearVersion"
                :options="compareYearVersionOptions"
                option-attribute="label"
                value-attribute="value"
                size="md"
                placeholder="Comparer avec..."
                class="w-full"
                :disabled="compareYearVersionOptions.length === 0"
                @update:model-value="handleCompareYearVersionChange"
              />
            </div>
          </div>

          <!-- Row 2: Search -->
          <div class="relative">
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass"
              placeholder="Rechercher..."
              size="md"
              class="w-full"
              :ui="{ icon: { trailing: { pointer: '' } } }"
            >
              <template v-if="searchQuery" #trailing>
                <UButton
                  color="gray"
                  variant="link"
                  icon="i-heroicons-x-mark"
                  :padded="false"
                  size="xs"
                  @click="searchQuery = ''"
                />
              </template>
            </UInput>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="mt-6">
        <!-- Loading state -->
        <div v-if="pending" class="flex justify-center py-16">
          <div class="text-center">
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-gray-400" />
            </div>
            <p class="font-medium text-gray-900 dark:text-white">Chargement des budgets</p>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Veuillez patienter...</p>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="mx-auto max-w-md py-12 text-center">
          <div
            class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20"
          >
            <UIcon name="i-heroicons-exclamation-triangle" class="h-10 w-10 text-red-500" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Erreur de chargement</h3>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Impossible de charger les données des ministères
          </p>
          <UButton color="gray" variant="solid" class="mt-6" @click="refresh()">
            Réessayer
          </UButton>
        </div>

        <!-- No results -->
        <div
          v-else-if="filteredMinistries.length === 0"
          class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-900"
        >
          <div
            class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <UIcon name="i-heroicons-building-office" class="h-8 w-8 text-gray-400" />
          </div>
          <p class="text-lg font-medium text-gray-900 dark:text-white">Aucun ministère trouvé</p>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {{ searchQuery ? `Aucun résultat pour "${searchQuery}"` : 'Aucune donnée disponible' }}
          </p>
          <UButton
            v-if="searchQuery"
            color="gray"
            variant="soft"
            class="mt-4"
            @click="searchQuery = ''"
          >
            Effacer la recherche
          </UButton>
        </div>

        <!-- Tableau des ministères -->
        <div
          v-else
          class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
        >
          <BudgetBudget2TableMinistryV2
            :ministries="filteredMinistries"
            :year="selectedYear"
            :version="selectedVersion"
          />
        </div>
      </div>

      <!-- Navigation buttons -->
      <div class="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
        <NuxtLink
          to="/budget-senegal/institutions"
          class="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors active:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:active:bg-gray-800"
        >
          <UIcon name="i-heroicons-building-library" class="h-4 w-4" />
          Institutions
        </NuxtLink>
        <NuxtLink
          to="/budget-senegal"
          class="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors active:bg-gray-800 dark:bg-white dark:text-gray-900 dark:active:bg-gray-100"
        >
          <UIcon name="i-heroicons-chart-bar" class="h-4 w-4" />
          Dashboard
        </NuxtLink>
      </div>
    </main>
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
  public_entity: {
    name: string;
    id: number;
    logo?: string;
    slug?: string;
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
  refresh,
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
  return data;
});

// Filter ministries based on search
const filteredMinistries = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return ministries.value;

  return ministries.value.filter(
    (m) =>
      m.public_entity.name.toLowerCase().includes(query) ||
      m.label.toLowerCase().includes(query) ||
      m.code.includes(query),
  );
});

// Calculate total budget
const totalBudget = computed(() => {
  return filteredMinistries.value.reduce((sum, m) => {
    const amount = parseFloat(m.amount_cp) || 0;
    return sum + amount;
  }, 0);
});

// Format budget for display
const formatBudget = (value: number) => {
  if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}Md`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
  return value.toLocaleString('fr-FR');
};
</script>
