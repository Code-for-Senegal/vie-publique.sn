<script setup>
const props = defineProps({
  revenueData: {
    type: Array,
    required: true,
  },
  expenseData: {
    type: Array,
    required: true,
  },
});

const revenueTotal = computed(() =>
  props.revenueData.reduce((sum, item) => sum + item.value, 0),
);
const expenseTotal = computed(() =>
  props.expenseData.reduce((sum, item) => sum + item.value, 0),
);

const getPercentage = (value, total) => ((value / total) * 100).toFixed(1);
</script>

<template>
  <div class="mx-auto space-y-4">
    <!-- <div class="mx-auto max-w-4xl p-2 text-sm sm:px-4"> -->
    <!-- Recettes -->
    <div class="mt-2 overflow-hidden">
      <h2 class="mb-2 p-2 text-center font-bold">Répartition des Recettes</h2>

      <div class="overflow-hidden">
        <table class="w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="text-black-800 px-2 py-2 text-left text-sm font-medium"
              >
                Recettes
              </th>
              <th
                class="text-black-800 px-2 py-2 text-right text-sm font-medium"
              >
                Montant
              </th>
              <!-- <th
                class="text-black-800 px-2 py-2 text-right text-sm font-medium"
              >
                Variation
              </th> -->
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="item in revenueData" :key="item.label">
              <td class="px-2 py-2 text-sm text-gray-900">
                <span
                  class="relative inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl dark:bg-gray-800"
                  ><span
                    class="text-xs font-medium leading-none text-gray-900 dark:text-white"
                    >{{ getPercentage(item.value, revenueTotal) }}%</span
                  ></span
                >
                {{ item.label }}
                <div class="mt-1 h-2 w-full rounded-full bg-gray-200">
                  <div
                    class="h-2 rounded-full bg-green-500"
                    :style="{
                      width: `${getPercentage(item.value, revenueTotal)}%`,
                    }"
                  ></div>
                </div>
              </td>
              <td class="px-2 py-2 text-right text-sm text-gray-900">
                {{ item.value.toLocaleString() }} Mrds
                <UBadge
                  variant="subtle"
                  class="custom-shadow w-13 ml-2 px-1"
                  :class="[
                    item.variation_percentage > 0
                      ? 'text-green-600'
                      : 'text-red-600',
                  ]"
                  >{{ item.variation_percentage > 0 ? "↑" : "↓" }}
                  {{ item.variation_percentage }}%</UBadge
                >
              </td>
              <!-- <td class="px-2 py-2 text-right text-sm text-gray-900">
                <UBadge
                  variant="subtle"
                  class="custom-shadow w-13 px-1"
                  :class="[
                    item.variation_percentage > 0
                      ? 'text-green-600'
                      : 'text-red-600',
                  ]"
                  >{{ item.variation_percentage > 0 ? "↑" : "↓" }}
                  {{ item.variation_percentage }}%</UBadge
                >
              </td> -->
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-white">
              <td class="px-2 py-2 text-sm font-semibold text-green-800">
                Total
              </td>
              <td
                class="px-2 py-2 text-right text-sm font-semibold text-green-800"
              >
                {{ revenueTotal.toLocaleString() }} Mds
              </td>
              <!-- <td
                class="px-2 py-2 text-right text-sm font-semibold text-green-800"
              >
                <UBadge
                  variant="subtle"
                  class="custom-shadow w-12 px-1 text-green-800"
                  >100%</UBadge
                >
              </td> -->
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Dépenses -->
    <div class="mt-2 overflow-hidden">
      <h2 class="mb-2 p-2 text-center font-bold">Répartition des Dépenses</h2>

      <div class="overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="text-black-800 px-2 py-2 text-left text-sm font-medium"
              >
                Dépenses
              </th>
              <th
                class="text-black-800 px-2 py-2 text-right text-sm font-medium"
              >
                Montant
              </th>
              <th
                class="text-black-800 px-2 py-2 text-right text-sm font-medium"
              >
                %
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="item in expenseData" :key="item.label">
              <td class="px-2 py-2 text-sm text-gray-900">
                {{ item.label }}
                <div class="h-2 w-full rounded-full bg-gray-200">
                  <div
                    class="h-2 rounded-full bg-red-500"
                    :style="{
                      width: `${getPercentage(item.value, expenseTotal)}%`,
                    }"
                  ></div>
                </div>
              </td>
              <td class="px-2 py-2 text-right text-sm text-gray-900">
                {{ item.value.toLocaleString() }}
              </td>
              <td class="px-2 py-2 text-right text-sm text-gray-900">
                <!-- {{ getPercentage(item.value, expenseTotal) }}% -->
                <UBadge variant="subtle" class="custom-shadow w-12 px-1"
                  >{{ getPercentage(item.value, revenueTotal) }}%</UBadge
                >
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-black-50">
              <td class="px-2 py-2 text-sm font-semibold text-red-800">
                Total
              </td>
              <td
                class="px-2 py-2 text-right text-sm font-semibold text-red-800"
              >
                {{ expenseTotal.toLocaleString() }} Mds
              </td>
              <td class="px-2 py-2 text-right text-sm font-semibold">
                <UBadge
                  variant="subtle"
                  class="custom-shadow w-12 px-1 text-red-800"
                  >100%</UBadge
                >
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Déficit -->
    <div class="hidden rounded-lg bg-white p-4 shadow">
      <div class="flex items-center justify-between">
        <span class="text-lg font-semibold">Déficit budgétaire</span>
        <span class="text-xl font-bold text-red-600">
          {{ (revenueTotal - expenseTotal).toLocaleString() }} Mds FCFA
        </span>
      </div>
    </div>
  </div>
</template>
