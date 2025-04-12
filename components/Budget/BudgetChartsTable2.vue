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
  <div class="space-y-4">
    <!-- Recettes -->
    <div class="custom-shadow mt-2 overflow-hidden rounded-lg shadow">
      <!-- <div class="border-b border-green-100 bg-green-700 p-2">
        <h3 class="text-center text-lg font-semibold text-white">
          Répartition des Recettes
        </h3>
      </div> -->
      <h2 class="mb-2 p-2 text-center font-bold">Répartition des Recettes</h2>
      <!-- Tableau -->
      <div class="relative overflow-hidden rounded-lg shadow">
        <table class="w-full divide-y divide-gray-200">
          <!-- En-tête fixe -->
          <div
            class="grid min-w-full grid-cols-12 bg-gray-50 text-sm font-semibold text-gray-900"
          >
            <div
              class="text-black-800 col-span-6 px-4 py-2 text-left text-sm font-medium"
            >
              Catégorie
            </div>
            <div
              class="text-black-800 col-span-3 px-4 py-2 text-right text-sm font-medium"
            >
              Montant
            </div>
            <div
              class="text-black-800 col-span-3 px-4 py-2 text-right text-sm font-medium"
            >
              %
            </div>
          </div>
          <!-- Corps du tableau avec scroll -->
          <div class="w-full divide-y divide-gray-200 overflow-auto bg-white">
            <div
              v-for="item in revenueData"
              :key="item.label"
              class="block cursor-pointer border-b border-gray-200 transition-colors hover:bg-gray-50"
            >
              <div class="grid min-w-full grid-cols-12 items-center py-3">
                <!-- nom -->
                <div class="col-span-6 px-4 py-2 text-sm text-gray-900">
                  {{ item.label }}
                  <div class="h-2 w-full rounded-full bg-gray-200">
                    <div
                      class="h-2 rounded-full bg-green-500"
                      :style="{
                        width: `${getPercentage(item.value, revenueTotal)}%`,
                      }"
                    ></div>
                  </div>
                </div>
                <!-- valeur -->
                <div
                  class="col-span-3 px-4 py-2 text-right text-sm text-gray-900"
                >
                  {{ item.value.toLocaleString() }}
                </div>
                <!-- pourcentage -->
                <div
                  class="col-span-3 px-4 py-2 text-right text-sm text-gray-900"
                >
                  <!-- {{ getPercentage(item.value, revenueTotal) }}% -->
                  <UBadge variant="subtle" class="custom-shadow w-12 px-1"
                    >{{ getPercentage(item.value, revenueTotal) }}%</UBadge
                  >
                </div>
              </div>
            </div>
          </div>
          <tfoot>
            <tr class="bg-black-50">
              <td class="px-4 py-2 text-sm font-semibold text-green-800">
                Total
              </td>
              <td
                class="px-4 py-2 text-right text-sm font-semibold text-green-800"
              >
                {{ revenueTotal.toLocaleString() }} Mds
              </td>
              <td
                class="px-4 py-2 text-right text-sm font-semibold text-green-800"
              >
                <!-- 100% -->
                <UBadge
                  variant="subtle"
                  class="custom-shadow w-12 px-1 text-green-800"
                  >100%</UBadge
                >
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Dépenses -->
    <div class="custom-shadow overflow-hidden rounded-lg shadow">
      <!-- <div class="border-b border-red-100 bg-red-700 p-2">
        <h3 class="text-center text-lg font-semibold text-white">
          Répartition des Dépenses
        </h3>
      </div> -->
      <h2 class="mb-2 p-2 text-center font-bold">Répartition des Dépenses</h2>

      <div class="overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="text-black-800 px-4 py-2 text-left text-sm font-medium"
              >
                Catégorie
              </th>
              <th
                class="text-black-800 px-4 py-2 text-right text-sm font-medium"
              >
                Montant
              </th>
              <th
                class="text-black-800 px-4 py-2 text-right text-sm font-medium"
              >
                %
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="item in expenseData" :key="item.label">
              <td class="px-4 py-2 text-sm text-gray-900">
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
              <td class="px-4 py-2 text-right text-sm text-gray-900">
                {{ item.value.toLocaleString() }}
              </td>
              <td class="px-4 py-2 text-right text-sm text-gray-900">
                <!-- {{ getPercentage(item.value, expenseTotal) }}% -->
                <UBadge variant="subtle" class="custom-shadow w-12 px-1"
                  >{{ getPercentage(item.value, revenueTotal) }}%</UBadge
                >
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-black-50">
              <td class="px-4 py-2 text-sm font-semibold text-red-800">
                Total
              </td>
              <td
                class="px-4 py-2 text-right text-sm font-semibold text-red-800"
              >
                {{ expenseTotal.toLocaleString() }} Mds
              </td>
              <td class="px-4 py-2 text-right text-sm font-semibold">
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
