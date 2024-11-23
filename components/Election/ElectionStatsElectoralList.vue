<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
      <h2 class="text-center text-xl font-semibold">
        Nombre de liste présentes sur les 54 départements
      </h2>
    </div>
    <UCard
      v-for="item in statsDepartmental"
      :key="item.coalition"
      class="custom-shadow flex flex-col gap-4"
    >
      <div class="flex items-center">
        <div class="mr-2 h-12 w-12 flex-shrink-0 md:w-16">
          <UAvatar
            :src="$directusImageUrl(getCoalitionLogoById(item.coalition), '25')"
            size="lg"
            loading="lazy"
            fetchpriority="high"
          />
        </div>
        <div class="flex-grow">
          <div class="flex items-center justify-between">
            <div
              class="line-clamp-2 text-sm font-semibold text-gray-700 md:text-lg"
            >
              {{ getCoalitionNameById(item.coalition) }}
            </div>
            <div
              class="rounded-full bg-gray-100 px-3 py-1 text-xl font-bold text-gray-600 md:text-lg"
            >
              {{ item.count.id }}
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { ElectionStatsList } from "~/types/election-stats-profession";
import type { Coalition } from "~/types/coalition";

const props = defineProps<{
  statsDepartmental: ElectionStatsList[];
  loading: boolean;
  coalitions: Coalition[];
}>();

// return coalition by id
const getCoalitionNameById = (id: number) => {
  console.log("id: " + id);
  const coalition = props.coalitions.find((item) => item.id === id);
  return coalition ? coalition.name : "";
};
const getCoalitionLogoById = (id: number) => {
  console.log("id: " + id);
  const coalition = props.coalitions.find((item) => item.id === id);
  return coalition ? coalition.logo : "";
};
</script>
