<!-- # components/Election/ -->
<!-- # components/ResultatsBarres.vue -->

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-semibold">Répartition des sièges</h3>
        <p class="text-sm text-gray-600">Total: {{ totalSeats }} sièges</p>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Barres des résultats -->
      <div
        v-for="result in sortedResults"
        :key="result.coalition"
        class="space-y-2"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- Avatar et infos de la tête de liste -->
            <div v-if="result.head_of_list" class="group relative">
              <UAvatar
                :src="result.head_of_list.photo_url"
                :alt="result.head_of_list.full_name"
                class="cursor-pointer"
                size="lg"
                loading="lazy"
                fetchpriority="high"
              />

              <!-- Tooltip avec nom complet -->
              <div
                class="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                {{ result.head_of_list.full_name }}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div
                class="h-3 w-3 rounded-full"
                :style="{ backgroundColor: result.color }"
              ></div>
              <span class="font-medium">{{ result.coalition }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold">{{ result.seats }}</span>
            <span class="text-xs text-gray-500">
              ({{ ((result.seats / totalSeats) * 100).toFixed(1) }}%)
            </span>
          </div>
        </div>

        <!-- Barre de progression -->
        <div
          class="relative h-6 w-full overflow-hidden rounded-full bg-gray-100"
        >
          <div
            class="relative h-full transition-all duration-1000 ease-out"
            :style="{
              width: `${(result.seats / totalSeats) * 100}%`,
              backgroundColor: result.color,
            }"
          >
            <div class="absolute inset-0 flex items-center justify-end px-2">
              <span
                class="text-xs font-medium"
                :class="
                  result.seats / totalSeats < 0.3
                    ? 'text-gray-700'
                    : 'text-white'
                "
              >
                {{ result.seats }} sièges
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistiques supplémentaires -->
      <div class="mt-8 border-t border-gray-200 pt-4">
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div class="rounded-lg bg-gray-50 p-3 text-center">
            <p class="text-sm text-gray-600">Nombre de sièges</p>
            <p class="text-lg font-bold">165</p>
          </div>
          <div class="rounded-lg bg-gray-50 p-3 text-center">
            <p class="text-sm text-gray-600">Majorité absolue</p>
            <p class="text-lg font-bold">83</p>
          </div>
          <div class="rounded-lg bg-gray-50 p-3 text-center">
            <p class="text-sm text-gray-600">Coalitions</p>
            <p class="text-lg font-bold">41</p>
          </div>
          <div class="rounded-lg bg-gray-50 p-3 text-center">
            <p class="text-sm text-gray-600">Coalition majoritaire</p>
            <p class="text-lg font-bold">{{ leadingCoalition.coalition }}</p>
          </div>
          <div class="rounded-lg bg-gray-50 p-3 text-center">
            <p class="text-sm text-gray-600">Participation</p>
            <p class="text-lg font-bold">49,72 %</p>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface HeadOfList {
  photo_url: string;
  full_name: string;
}

interface CoalitionData {
  coalition: string;
  color: string;
  seats: number;
  head_of_list: HeadOfList | null;
}

const props = defineProps<{
  data: CoalitionData[];
}>();

// Calculs dérivés
const totalSeats = computed(() =>
  props.data.reduce((acc, curr) => acc + curr.seats, 0),
);

const sortedResults = computed(() =>
  [...props.data].sort((a, b) => b.seats - a.seats),
);

const leadingCoalition = computed(() => sortedResults.value[0]);
</script>
