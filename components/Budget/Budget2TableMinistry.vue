<template>
  <div>
    <div class="text-center">
      <p class="mb-2 text-sm text-gray-500">Montant en Milliards FCFA</p>
    </div>
    <div class="overflow-x-auto shadow-lg">
      <div class="min-w-full align-middle">
        <div
          class="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg"
        >
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  class="sm:text-normal px-2 py-2 text-left text-xs font-medium tracking-wider text-gray-500"
                >
                  {{ type == "ministries" ? "Ministère" : "Institution" }}
                </th>
                <th
                  scope="col"
                  class="sm:text-normal group cursor-pointer px-1 py-2 text-right text-xs font-medium tracking-wider text-gray-500"
                  @click="toggleSort"
                >
                  <div class="inline-flex items-center">
                    Budget <br />2025
                    <span class="m-0">
                      {{ sortDirection === "asc" ? "↑" : "↓" }}
                    </span>
                  </div>
                </th>
                <th
                  scope="col"
                  class="sm:text-normal px-1 text-right text-xs font-medium tracking-wider text-gray-500 sm:table-cell"
                >
                  Vs. <br />2024
                </th>
                <th
                  scope="col"
                  class="sm:text-normal px-1 py-2 text-right text-xs font-medium tracking-wider text-gray-500 sm:table-cell"
                >
                  Poids <br />budget
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr
                v-for="ministry in budgetWithPercent"
                :key="ministry.name"
                class="hover:bg-gray-50"
              >
                <td class="whitespace-normal px-2 py-2 text-sm text-gray-900">
                  <div class="max-w-xs sm:max-w-none">
                    {{ ministry.name }}
                  </div>
                </td>
                <td class="px-1 py-2 text-right text-sm">
                  <span class="font-medium text-gray-900">
                    {{
                      ministry.budget_2025.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })
                    }}
                  </span>
                  <!-- <div>
                    <UBadge
                      variant="subtle"
                      class="custom-shadow sm:hidden"
                      :class="
                        ministry.variation_percentage >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      "
                    >
                      {{ ministry.variation_percentage >= 0 ? "+" : ""
                      }}{{ ministry.variation_percentage.toFixed(1) }}%
                    </UBadge>
                  </div> -->
                </td>
                <td class="px-1 py-2 text-right text-sm sm:table-cell">
                  <UBadge
                    variant="subtle"
                    class="custom-shadow w-12 px-1"
                    :class="
                      ministry.variation_percentage >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    "
                  >
                    {{ ministry.variation_percentage >= 0 ? "+" : ""
                    }}{{ ministry.variation_percentage.toFixed(1) }}%
                  </UBadge>
                </td>
                <td
                  class="px-1 py-2 text-right text-sm font-medium text-gray-900 sm:table-cell"
                >
                  <UBadge variant="subtle" class="custom-shadow w-10 px-1"
                    >{{ ministry.budget_percentage.toFixed(1) }}%</UBadge
                  >
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
  type: {
    type: String,
    required: true,
  },
});

const sortDirection = ref("desc");
const totalBudget = 6395.1;

// Données budgétaires triées
const budgetWithPercent = computed(() => {
  if (!props.ministries) return [];
  const data = props.ministries.map((ministry) => ({
    ...ministry,
    percentTotal: ((ministry.budget_2025 / totalBudget) * 100).toFixed(1),
  }));

  // Tri des données
  return data.sort((a, b) => {
    const modifier = sortDirection.value === "desc" ? -1 : 1;
    return (a.budget_2025 - b.budget_2025) * modifier;
  });
});

// Fonction pour changer la direction du tri
const toggleSort = () => {
  sortDirection.value = sortDirection.value === "desc" ? "asc" : "desc";
};
</script>
