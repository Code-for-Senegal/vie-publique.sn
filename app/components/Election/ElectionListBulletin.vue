<template>
  <p class="mb-2 text-center text-sm text-gray-500">
    Cliquez sur un bulletin pour voir les candidats
  </p>

  <div class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
    <div v-if="loading">
      <div v-for="n in 41" :key="n" class="w-full">
        <div class="h-48 w-full animate-pulse rounded-lg bg-gray-200"></div>
      </div>
    </div>

    <div
      v-for="coalition in coalitions"
      v-else
      :key="coalition.id"
      class="custom-shadow w-full"
    >
      <!-- Redirection vers la page de détails de la coalition -->
      <NuxtLink
        :to="`/elections/legislatives/${coalition.id}`"
        class="group block"
      >
        <CmsImage
          :src="coalition.bulletin"
          :alt="`Bulletin de ${coalition.name}`"
          :quality="25"
          class="h-48 w-full transform rounded-lg object-cover transition-transform duration-200 ease-in-out group-hover:scale-105"
          loading="lazy"
          fetchpriority="high"
        />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Coalition } from "~/types/coalition";

defineProps<{
  coalitions: Coalition[];
  loading: boolean;
}>();
</script>
