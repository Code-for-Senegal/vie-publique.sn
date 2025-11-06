<script setup lang="ts">
const props = defineProps({
  year: {
    type: Number,
    required: true,
  },
  version: {
    type: [Number, null],
    default: null,
  },
  level: {
    type: String,
    default: 'ministry', // 'ministry' ou 'institution'
  },
  title: {
    type: String,
    default: '',
  },
  compareYear: {
    type: [Number, null],
    default: null,
  },
  compareVersion: {
    type: [Number, null],
    default: null,
  },
});

// Titre dynamique
const displayTitle = computed(() => {
  if (props.title) return props.title;
  return props.level === 'institution' ? 'Institution' : 'Ministère';
});

// Fetch des données
const {
  data: ministriesData,
  pending,
  error,
} = await useFetch('/api/budget/ministries', {
  key: computed(() => {
    const compareKey = props.compareYear && props.compareVersion
      ? `-vs-${props.compareYear}-${props.compareVersion}`
      : '';
    return `ministries-${props.year}-${props.version || 'latest'}-${props.level}${compareKey}`;
  }),
  query: computed(() => ({
    year: props.year,
    version: props.version,
    level: props.level,
    compareYear: props.compareYear,
    compareVersion: props.compareVersion,
  })),
  watch: [() => props.year, () => props.version, () => props.level, () => props.compareYear, () => props.compareVersion],
  server: true,
  lazy: false, // Force le fetch immédiat pour éviter hydration mismatch
});

// Computed pour les données
const ministries = computed(() => {
  return ministriesData.value?.ministries || [];
});
</script>

<template>
  <div>
    <!-- État de chargement -->
    <div v-if="pending" class="flex justify-center py-12">
      <div class="text-center">
        <div
          class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span
            class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
            >Chargement...</span
          >
        </div>
        <p class="mt-4 text-gray-600">Chargement des budgets...</p>
      </div>
    </div>

    <!-- Erreur -->
    <UAlert
      v-else-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      title="Erreur de chargement"
      :description="`Impossible de charger les données des ${displayTitle.toLowerCase()}s.`"
    />

    <!-- Message si aucune donnée -->
    <div v-else-if="ministries.length === 0" class="py-12 text-center">
      <UIcon name="i-heroicons-building-office" class="mx-auto mb-4 h-16 w-16 text-gray-400" />
      <p class="text-gray-600 dark:text-gray-400">Données non renseignées pour cette année</p>
    </div>

    <!-- Tableau des ministères -->
    <BudgetBudget2TableMinistryV2 v-else :ministries="ministries" :year="year" :version="version" />
  </div>
</template>
