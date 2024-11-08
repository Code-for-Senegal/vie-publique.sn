<template>
  <p class="mb-2 text-center text-sm text-gray-500">
    Cliquez sur une photo pour voir la liste des candidats
  </p>
  <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
    <div v-if="loading">
      <div v-for="n in 41" :key="n" class="w-full">
        <div class="h-48 w-full animate-pulse rounded-lg bg-gray-200"></div>
      </div>
    </div>

    <div
      v-else
      v-for="coalition in coalitions"
      :key="coalition.id"
      class="relative flex h-56 flex-col overflow-hidden rounded-lg shadow-lg"
    >
      <NuxtLink
        :to="`/elections/legislatives/${coalition.id}`"
        class="group block"
      >
        <img
          :src="$directusImageUrl(coalition.head_of_list?.photo, '50')"
          alt="Photo tête de liste"
          class="h-full w-full object-cover"
          loading="lazy"
          fetchpriority="high"
        />

        <div class="absolute inset-0 bg-black bg-opacity-40"></div>

        <!-- Texte superposé (Nom, prénom, profession) -->
        <div class="absolute inset-0 flex flex-col justify-end p-2 text-white">
          <!-- <div
                        class="absolute left-2 top-2 rounded-full p-1 text-xs font-bold text-white"
                        :class="
                          item.is_substitute ? 'bg-orange-600' : 'bg-green-700'
                        "
                        style="
                          width: 30px;
                          height: 30px;
                          display: flex;
                          justify-content: center;
                          align-items: center;
                        "
                      >
                        {{ candidate.position }}
                      </div> -->
          <h4 class="font-bold capitalize">
            {{ coalition.head_of_list?.first_name.toLowerCase() }}
            <span class="capitalize">
              {{ coalition.head_of_list?.last_name.toUpperCase() }}
            </span>
          </h4>

          <p
            class="line-clamp-1 rounded-full bg-green-700 px-1 text-xs lowercase capitalize"
          >
            {{ coalition.name }}
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
