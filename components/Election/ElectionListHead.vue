<template>
  <p class="mb-2 text-center text-sm text-gray-500">
    Cliquez sur une photo pour voir la liste des candidats
  </p>
  <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
    <!-- Skeleton de chargement -->
    <div v-if="loading">
      <div v-for="n in 41" :key="n" class="w-full">
        <div class="h-48 w-full animate-pulse rounded-lg bg-gray-200"></div>
      </div>
    </div>

    <!-- Affichage des coalitions -->
    <div
      v-for="coalition in coalitions"
      v-else
      :key="coalition.id"
      class="relative flex flex-col overflow-hidden rounded-lg shadow-lg"
      style="height: 250px"
    >
      <NuxtLink
        :to="`/elections/legislatives/${coalition.id}`"
        class="group block"
      >
        <img
          :src="$directusImageUrl(coalition.head_of_list?.photo, '25')"
          alt="Photo tête de liste"
          class="h-full w-full object-contain"
          loading="lazy"
          fetchpriority="high"
        />

        <!-- Overlay sombre pour le texte -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"
        ></div>

        <!-- Détails de la tête de liste -->
        <div class="absolute inset-0 flex flex-col justify-end p-2 text-white">
          <h4 class="font-bold capitalize">
            {{ coalition.head_of_list?.first_name.toLowerCase() }}
            <span class="capitalize">
              {{ coalition.head_of_list?.last_name.toUpperCase() }}
            </span>
          </h4>

          <p
            class="line-clamp-1 rounded-full bg-green-700 px-1 text-xs font-bold lowercase capitalize"
          >
            {{ coalition.list_order }}. {{ coalition.name }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Coalition } from "~/types/coalition";

const props = defineProps<{
  coalitions: Coalition[];
  loading: boolean;
}>();
</script>
