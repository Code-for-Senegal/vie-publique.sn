<template>
  <p class="mb-2 text-center text-sm text-gray-500">
    Cliquez sur une liste pour voir les candidats
  </p>

  <div class="flex flex-col gap-2">
    <!-- Skeleton de chargement -->
    <template v-if="loading">
      <UCard v-for="n in 5" :key="n" class="custom-shadow p-4">
        <div class="flex animate-pulse items-center gap-2">
          <div class="h-12 w-12 flex-shrink-0 rounded-full bg-gray-300"></div>
          <div class="flex-grow">
            <div class="mb-2 h-4 w-3/4 rounded bg-gray-300"></div>
            <div class="h-3 w-1/2 rounded bg-gray-300"></div>
          </div>
        </div>
      </UCard>
    </template>

    <!-- Liste réelle des coalitions -->
    <template v-else>
      <UCard
        v-for="coalition in coalitions"
        :key="coalition.id"
        class="custom-shadow"
      >
        <NuxtLink
          class="flex flex-row items-center gap-2"
          :to="`/elections/legislatives/${coalition.id}`"
        >
          <div class="h-12 w-12 flex-shrink-0 md:w-16">
            <UAvatar
              v-if="coalition.logo"
              :src="$directusImageUrl(coalition.logo, '25')"
              :alt="coalition.name"
              size="lg"
              loading="lazy"
              fetchpriority="high"
            />
            <UAvatar v-else icon="i-heroicons-photo" size="lg" />
          </div>
          <div class="flex-grow">
            <h2 class="font-semibold md:text-lg">
              {{ coalition.list_order }}.
              {{ coalition.name }}
            </h2>
            <p class="text-sm capitalize text-gray-600">
              {{ coalition.head_of_list?.first_name.toLowerCase() }}
              {{ coalition.head_of_list?.last_name.toLowerCase() }}
            </p>
          </div>
        </NuxtLink>
      </UCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Coalition } from "~/types/coalition";

const props = defineProps<{
  coalitions: Coalition[];
  loading: boolean;
}>();
</script>
