<template>
  <div>
    <div class="text-center">
      <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">Montant en Milliards FCFA</p>
    </div>
    <div class="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800">
      <!-- En-têtes -->
      <div
        class="flex items-center justify-between gap-2 bg-gray-200 px-2 py-3 text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-300"
      >
        <span class="flex-1">Ministère</span>
        <div class="flex shrink-0 items-center gap-4">
          <span class="hidden cursor-pointer sm:inline" @click="toggleSort">
            Budget {{ year }} {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
          <span class="cursor-pointer sm:hidden" @click="toggleSort">
            {{ year }} {{ sortDirection === 'asc' ? '↑' : '↓' }}
          </span>
          <span v-if="hasVariations" class="hidden sm:inline">Variation</span>
        </div>
      </div>

      <!-- Items -->
      <div
        v-for="ministry in sortedMinistries"
        :key="ministry.id"
        class="border-b border-gray-100 px-2 py-3 text-sm text-gray-900 last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
      >
        <div class="flex items-start gap-2">
          <!-- Logo + Pourcentage cercle -->
          <div class="flex flex-col items-center gap-1">
            <!--   <CmsImage
              v-if="ministry.entity?.logo"
              :src="ministry.entity.logo"
              :alt="ministry.entity?.name || ministry.label"
              class="h-10 w-10 rounded-full object-cover"
              :quality="60"
            />
            <div
              v-else -->
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <UIcon name="i-heroicons-building-office" class="h-5 w-5 text-gray-400" />
            </div>
            <span class="text-xs font-medium leading-none text-gray-600 dark:text-gray-400">
              {{ ministry.budget_percentage.toFixed(1) }}%
            </span>
          </div>

          <!-- Contenu principal -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <!-- Nom du ministère -->
              <div class="line-clamp-2 flex-1">
                <NuxtLink
                  v-if="ministry.entity?.public_slug"
                  :to="`/budget-senegal/${ministry.entity.public_slug}`"
                  class="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {{ ministry.entity?.name || ministry.label }}
                </NuxtLink>
                <span v-else class="text-sm font-medium">
                  {{ ministry.entity?.name || ministry.label }}
                </span>
              </div>

              <!-- Montant -->
              <span class="shrink-0 text-sm font-semibold">{{
                parseFloat(ministry.amount_cp).toLocaleString(undefined, {
                  maximumFractionDigits: 1,
                })
              }}</span>
            </div>

            <!-- Barre de progression -->
            <div class="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                class="h-2 rounded-full bg-yellow-500"
                :style="{
                  width: `${ministry.budget_percentage}%`,
                }"
              ></div>
            </div>

            <!-- Badge variation (ligne après la barre) -->
            <div
              v-if="hasVariations && ministry.variation_percentage"
              class="mt-1 flex justify-end"
            >
              <UBadge
                variant="solid"
                :class="[
                  'shrink-0 rounded-full border-none px-2 text-xs font-medium',
                  {
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':
                      ministry.variation_color === 'green',
                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400':
                      ministry.variation_color === 'red',
                    'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300':
                      ministry.variation_color === 'gray',
                  },
                ]"
              >
                {{
                  ministry.variation_percentage.startsWith('+')
                    ? '↑'
                    : ministry.variation_percentage.startsWith('-')
                      ? '↓'
                      : ''
                }}
                {{ ministry.variation_percentage.replace('+', '').replace('-', '') }}
              </UBadge>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  ministries: {
    type: Array,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  version: {
    type: [Number, null],
    default: null,
  },
});

const sortDirection = ref('desc');

// Vérifier si au moins un ministère a des données de variation
const hasVariations = computed(() => {
  return props.ministries.some(
    (ministry) => ministry.variation_percentage && ministry.variation_percentage !== null,
  );
});

// Récupérer le budget global (expense_total) pour calculer les pourcentages
const { data: budgetGlobalData } = await useFetch('/api/budget/global', {
  key: computed(() => `budget-global-${props.year}-${props.version || 'latest'}`),
  query: computed(() => ({
    year: props.year,
    version: props.version,
  })),
  watch: [() => props.year, () => props.version],
});

// Total des dépenses (expense_total) - chercher dans allMetrics
const totalExpenses = computed(() => {
  if (!budgetGlobalData.value) return 0;

  // Chercher expense_total dans allMetrics
  const expenseTotal = budgetGlobalData.value.allMetrics?.find(
    (item) => item.code === 'expense_total',
  );

  return expenseTotal ? parseFloat(expenseTotal.value) : 0;
});

// Données avec pourcentage basé sur le budget global
const sortedMinistries = computed(() => {
  if (!props.ministries) return [];

  const data = props.ministries.map((ministry) => ({
    ...ministry,
    budget_percentage:
      totalExpenses.value > 0 ? (parseFloat(ministry.amount_cp) / totalExpenses.value) * 100 : 0,
  }));

  // Tri des données
  return data.sort((a, b) => {
    const modifier = sortDirection.value === 'desc' ? -1 : 1;
    return (parseFloat(a.amount_cp) - parseFloat(b.amount_cp)) * modifier;
  });
});

// Fonction pour changer la direction du tri
const toggleSort = () => {
  sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc';
};
</script>
