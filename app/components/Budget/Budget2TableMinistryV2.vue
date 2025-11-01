<template>
  <div>
    <div class="text-center">
      <p class="mb-2 text-sm text-gray-500">Montant en Milliards FCFA</p>
    </div>
    <div class="overflow-x-auto shadow-lg">
      <div class="min-w-full align-middle">
        <div class="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  class="border-b border-gray-200 px-2 py-2 text-left text-xs font-semibold tracking-wider text-gray-500 dark:border-gray-600 dark:text-gray-300 sm:text-sm"
                >
                  Ministère
                </th>
                <th
                  scope="col"
                  class="group cursor-pointer border-b border-gray-200 px-1 py-2 text-right text-xs font-semibold tracking-wider text-gray-500 dark:border-gray-600 dark:text-gray-300 sm:text-sm"
                  @click="toggleSort"
                >
                  <div class="inline-flex items-center">
                    Budget <br />{{ year }}
                    <span class="m-0">
                      {{ sortDirection === 'asc' ? '↑' : '↓' }}
                    </span>
                  </div>
                </th>
                <th
                  scope="col"
                  class="border-b border-gray-200 px-1 py-2 text-right text-xs font-semibold tracking-wider text-gray-500 dark:border-gray-600 dark:text-gray-300 sm:table-cell sm:text-sm"
                >
                  Poids <br />budget
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              <tr
                v-for="ministry in sortedMinistries"
                :key="ministry.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td class="whitespace-normal border-b border-gray-200 px-2 py-2 text-sm text-gray-900 dark:border-gray-700 dark:text-gray-100">
                  <div class="max-w-xs sm:max-w-none">
                    {{ ministry.entity?.name || ministry.label }}
                  </div>
                </td>
                <td class="border-b border-gray-200 px-1 py-2 text-right text-sm dark:border-gray-700">
                  <span class="font-medium text-gray-900 dark:text-gray-100">
                    {{
                      parseFloat(ministry.amount_cp).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })
                    }}
                  </span>
                </td>
                <td class="border-b border-gray-200 px-1 py-2 text-right text-sm font-medium text-gray-900 dark:border-gray-700 dark:text-gray-100 sm:table-cell">
                  <UBadge variant="subtle" class="w-10 px-1 dark:text-gray-300">
                    {{ ministry.budget_percentage.toFixed(1) }}%
                  </UBadge>
                </td>
              </tr>
            </tbody>
          </table>
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
});

const sortDirection = ref('desc');

// Calculer le total du budget
const totalBudget = computed(() => {
  if (!props.ministries || props.ministries.length === 0) return 0;
  return props.ministries.reduce((sum, ministry) => {
    return sum + parseFloat(ministry.amount_cp || 0);
  }, 0);
});

// Données avec pourcentage
const sortedMinistries = computed(() => {
  if (!props.ministries) return [];

  const data = props.ministries.map((ministry) => ({
    ...ministry,
    budget_percentage: totalBudget.value > 0
      ? (parseFloat(ministry.amount_cp) / totalBudget.value) * 100
      : 0,
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
