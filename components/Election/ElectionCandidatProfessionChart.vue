<template>
  <UCard class="custom-shadow">
    <template #header>
      <div
        class="mb-4 flex flex-col items-center justify-between gap-2 md:flex-row"
      >
        <h2 class="text-center text-xl font-semibold">
          Classement des professions des 7294 candidats
        </h2>
        <p class="text-center text-sm text-gray-500">
          3853 titulaires et 3441 suppléants
        </p>
      </div>
    </template>

    <div class="flex flex-col gap-4">
      <div
        v-for="item in professions"
        :key="item.profession"
        class="flex flex-col gap-2"
      >
        <div class="flex items-center justify-between">
          <!-- Profession Name -->
          <div class="text-sm">
            <span
              class="rounded-full bg-gray-100 px-2 py-2 text-sm font-bold text-gray-500 md:text-lg"
              >{{ item.count.id }}
            </span>
            <span class="text-sm md:text-lg">&nbsp;{{ item.profession }}</span>
          </div>

          <!-- Profession Count -->
          <div
            class="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 md:text-lg"
          >
            {{ calculatePercentage(item.count.id) }}%
          </div>
        </div>

        <UDivider class="mb-2" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ElectionStatsProfession } from "~/types/election-stats-profession";

const props = defineProps<{
  professions: ElectionStatsProfession[];
  loading: boolean;
}>();

const totalCandidates = ref(7294);

// Calculer le pourcentage pour chaque profession
const calculatePercentage = (count: string) => {
  const total = totalCandidates.value;
  return total ? ((parseInt(count) / total) * 100).toFixed(1) : 0;
};
</script>
