<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  budgetData: {
    type: Array,
    required: true,
  },
});

const total = computed(() =>
  props.budgetData.reduce((sum, item) => sum + item.value, 0),
);

const getPercentage = (value, total) => ((value / total) * 100).toFixed(1);
</script>

<template>
  <div class="mx-auto space-y-4">
    <div class="mt-2">
      <h2 class="mb-2 p-2 text-center font-bold">{{ title }}</h2>

      <div class="space-y-2 bg-white shadow-lg">
        <!-- En-têtes -->
        <div class="bg-gray-50 px-2 py-2 text-sm font-medium text-gray-500">
          <div class="flex items-center justify-between gap-2">
            <span class="flex-1">Nature</span>
            <div class="flex shrink-0 items-center gap-4">
              <span>Montant</span>
            </div>
          </div>
        </div>
        <!-- Items -->
        <div
          v-for="item in budgetData"
          :key="item.label"
          class="px-2 py-2 text-sm text-gray-900"
        >
          <div class="flex items-start gap-2">
            <!-- Pourcentage cercle -->
            <span
              class="relative inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xl dark:bg-gray-800"
            >
              <span
                class="text-xs font-medium leading-none text-gray-900 dark:text-white"
              >
                {{ getPercentage(item.value, total) }}%
              </span>
            </span>

            <!-- Contenu principal -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <span class="line-clamp-1 block flex-1 text-sm">{{
                  item.label
                }}</span>
                <div class="flex shrink-0 items-center">
                  <span class="text-sm">{{ item.value.toLocaleString() }}</span>
                  <UBadge
                    v-if="item.variation_percentage"
                    variant="subtle"
                    class="custom-shadow ml-2 px-1 text-xs"
                    :class="[
                      item.variation_percentage > 0
                        ? 'text-green-600'
                        : 'text-red-600',
                    ]"
                  >
                    {{ item.variation_percentage > 0 ? "↑" : "↓" }}
                    {{ item.variation_percentage }}%
                  </UBadge>
                </div>
              </div>

              <!-- Barre de progression -->
              <div class="mt-2 h-2 w-full rounded-full bg-gray-200">
                <div
                  :class="`h-2 rounded-full bg-${color}-500`"
                  :style="{
                    width: `${getPercentage(item.value, total)}%`,
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Total -->
        <div :class="`px-2 py-2 text-sm font-semibold text-${color}-800`">
          <div class="flex items-center justify-between">
            <span class="pl-1">Total</span>
            <span>{{ total.toLocaleString() }} Mds</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
